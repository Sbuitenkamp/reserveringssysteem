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
                switchCreate(data, message);
                break;
            case 'select':
                switchSelect(data, message);
                break;
            case 'update':
                switchUpdate(data, message)
                break;
            case 'destroy':
                switchDestroy(data, message)
                break;
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
        if (req.session.user) res.render(url, {username: req.session.user.username});
        else res.render(url);
    }
    else res.redirect('/page-not-found');
});

// Authenticate the user who attempts to login
server.post('/authenticate', (req, res) => {
    const { username, password } = req.body;
    authenticateUser(username, password)
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
    return res.end();
    const result = await select({
        table: 'reservations',
        // TODO add select rules
    });
    const html = res.render(path.join(`${__dirname}/models/reservation-pop-up.ejs`), { number: req.body.number, result });
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

function socketSend(data) {
    ws.send(JSON.stringify(data));
}

// CRUD functions //
async function create({ table, values }) {
    server.log(`creating entry in ${table}...`);
    values = await associate(table, values);
    return db[table].create(values).catch(e => server.error('an error occurred while creating entries in database.', e));
}

function select({ table, options }) {
    server.log(`fetching ${options.limit || 'all'} entries from ${table}...`);
    return db[table].find(options).catch(e => server.error('an error occurred while selecting entries from database.', e));
}
  
async function update({ table, options, values }) {
    server.log(`updating entries from ${table}...`);
    values = await associate(table, values);
    return db[table].updateOne(options, values).catch(e => server.error('an error occurred while updating entries from database.', e));
}

function destroy({ table, options }) {
    server.log(`deleting entries from ${table}...`);
    return db[table].remove(options).catch(e => server.error('an error occurred while deleting entries from database.', e));
}

// other functions
function associate(table, values) {
    return new Promise(async resolve => {
        if (table === 'reservations') {
            if (values.guestId) {
                const guest = await db.guests.findOne({ _id: values.guestId });
                values.guest = new db.guests({ ...guest._doc });
                delete values.guestId;
            }
            if (values.objectIds) {
                if (values.objectIds.length) {
                    await new Promise(res => {
                        values.objects = [];
                        values.objectIds.forEach(async (objectId, index) => {
                            const object = await db.objects.findOne({ _id: objectId });
                            values.objects[index] = new db.objects({ ...object._doc });
                        });
                        setTimeout(() => {
                            res();
                        }, 1000);
                    });
                }
                delete values.objectIds;
            }
        }
        resolve(values);
    });
}

// Shortened the functions for switch //
async function switchSelect(data, message) {
    data = await select(message).catch(e => {
        server.log('| an error occurred during the selection of one or more database entries:');
        server.error(e);
    });
    socketSend(data);
}

async function switchCreate(data, message) {
    data = await create(message).catch(e => {
        server.log(new Date() + '| an error occurred during the creation of one or more database entries:');
        server.error(e);
    });
    socketSend(data);
}

async function switchUpdate(data, message) {
    data.rowsAffected = await update(message);
    data.update = true;
    socketSend(data);
}

async function switchDestroy(data, message) {
    data.rowsAffected = await destroy(message);
    data.destroy = true;
    socketSend(data);
}

// Functions for authenticating the user for login
function authenticateUser(username, password) {
    select({ options: { username }, table: 'users' }).then((result) => {
        const [user] = result;
        userExists(user, password, user.password)
    });
}

// This will check if the user exists in the database
function userExists(user, password, userPassword) {
    if (!user) {
        server.log("Username or password is incorrect");
        res.redirect('/');
    } else {
        validatePassword(password, userPassword)
    }
}

/*
    This will use bcrypt.compare to see if the passwords match
    If the passwords match, it will pass the result into validResult()
*/

function validatePassword(password, userPassword) {
    bcrypt.compare(password, userPassword, (err, result) => {
        if (err) throw err;
        if (!result) {
            server.log("Username or password is incorrect");
            res.redirect('/');
        } else {
            req.session.user = {
                id: user.id,
                username: user.username,
                superUser: user.superUser
            };
            update({
                table: 'reservations',
                options: { id: '5d036fd39d1a97414cb39bcf' },
                values: {
                    objectIds: ['5d03766e24a65318a8d7687b']
                }
            }).then(() => res.redirect('/reservation-overview'))
        }
    });
}
/*
    This is for bcrypt.compare, since it takes 'err' and 'result' as callback
    If there is no result, the user can't be logged in and had to try again
*/

function validResult(result) {
    if (!result) {
        server.log("Username or password is incorrect");
        res.redirect('/');
    } else {
        req.session.user = {
            id: user.id,
            username: user.userName,
            superUser: user.superUser
        };
        res.redirect('/reservation-overview');
    }
}