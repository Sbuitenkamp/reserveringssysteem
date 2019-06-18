const express = require('express');
const server = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { Server: WebSocketServer } = require('ws');
const { green, yellow, red, blue } = require('chalk');
const db = require('./models/db');
const { dbHost } = require('./config.json');
const port = process.env.PORT || 3000;
const wss = new WebSocketServer({ port: 40510 });

server.listen(port, () => server.log(`Server listening at http://${dbHost}:${port}`));
server.set('view engine', 'ejs');
server.use(express.static(`${__dirname}/controllers`));
server.use(express.static(`${__dirname}/styles`));
server.use(bodyParser.urlencoded({ extended: false }));
server.use(bodyParser.json());
server.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
server.use(session({
    secret: 'yrla is thicc af',
    resave: false,
    saveUninitialized: false
}));

// websocket
wss.on('connection', ws => {
    ws.on('message', async message => {
        let data = {};
        message = JSON.parse(message);
        switch (message.type) {
            case 'create':
                data = await switchCreate(data, message);
                return ws.send(JSON.stringify(data));
            case 'select':
                data = await switchSelect(data, message);
                return ws.send(JSON.stringify(data));
            case 'update':
                data = await switchUpdate(data, message);
                return ws.send(JSON.stringify(data));
            case 'destroy':
                data = await switchDestroy(data, message);
                return ws.send(JSON.stringify(data));
            default:
                throw new Error('database operation was not defined (this is a user-made error)');
        }
    });
});

// Dynamic file serving //
server.get('/', (req, res) => res.redirect('/index'));
server.get('/:path', (req, res) => {
    if (req.params.path.trim().toLowerCase().endsWith('.html')) return res.redirect(req.params.path.substring(0, req.params.path.length - 5));
    if (!req.session.user && req.params.path !== 'index') return res.redirect('/index');
    if (req.session.user && req.params.path === 'index') return res.redirect('/reservation-overview');
    const url = path.join(`${__dirname}/views/${req.params.path}.ejs`);
    if (fs.existsSync(url)) {
        if (req.session.user) res.render(url, { username: req.session.user.username });
        else res.render(url);
    }
    else res.redirect('/page-not-found');
});

// Authenticate the user who attempts to login
server.post('/authenticate', (req, res) => {
    const { username, password } = req.body;
    select({ options: { username }, table: 'users' }).then(result => {
        const [user] = result;
        if (!user) {
            server.log(`user ${username} doesn't exist`);
            res.redirect('/');
        } else {
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) throw err;
                if (!result) {
                    server.log(`password for ${username} is incorrect`);
                    res.redirect('/');
                } else {
                    req.session.user = {
                        id: user.id,
                        username: user.username,
                        superUser: user.superUser
                    };
                    res.redirect('/reservation-overview');
                }
            });
        }
    });
});

// Logout
server.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/index');
});

/* 
    Since we don't use partials in this project,
    the pop-up partial will be retrieved in the view by a post request
*/
server.post('/reservation-pop-up', async (req, res) => {
    req.body.number = Number(req.body.number);
    const result = await select({
        table: 'reservations',
        options: {
            number: req.body.number,
        }
    });
    const html = res.render(path.join(`${__dirname}/models/reservation-pop-up.ejs`), { number: req.body.number, result });
    res.send(html);
});

server.post('/guest-pop-up', async (req, res) => {
    req.body.number = Number(req.body.number);
    const result = await select({
        table: 'guests',
        options: { number: req.body.number }
    });
    const html = res.render(path.join(`${__dirname}/models/guest-pop-up.ejs`), { number: req.body.number, result });
    res.send(html);
});

// logging methods
server.log = message => {
    console.log(green(`${blue(new Date())} | ${message}`));
};
server.error = (message, e) => {
    console.log(yellow(`${blue(new Date())} | ${message}`));
    console.error(red(e));
};

// CRUD functions //
async function create({ table, values }) {
    server.log(`creating entry in ${table}...`);
    return db[table].create(values).catch(e => server.error('an error occurred while creating entries in database.', e));
}

function select({ table, options }) {
    server.log(`fetching ${options.limit || 'all'} entries from ${table}...`);
    return db[table].find(options).catch(e => server.error('an error occurred while selecting entries from database.', e));
}
  
async function update({ table, options, values }) {
    server.log(`updating entries from ${table}...`);
    return db[table].updateOne(options, values).catch(e => server.error('an error occurred while updating entries from database.', e));
}

function destroy({ table, options }) {
    server.log(`deleting entries from ${table}...`);
    return db[table].remove(options).catch(e => server.error('an error occurred while deleting entries from database.', e));
}

// Shortened the functions for switch (except it ain't shorter u nub ¯\_(ツ)_/¯)
async function switchSelect(data, message) {
    return select(message).catch(e => {
        server.log('| an error occurred during the selection of one or more database entries:');
        server.error(e);
    });
}

async function switchCreate(data, message) {
    return create(message).catch(e => {
        server.log(new Date() + '| an error occurred during the creation of one or more database entries:');
        server.error(e);
    });
}

async function switchUpdate(data, message) {
    data.rowsAffected = await update(message);
    data.update = true;
}

async function switchDestroy(data, message) {
    data.rowsAffected = await destroy(message);
    data.destroy = true;
}