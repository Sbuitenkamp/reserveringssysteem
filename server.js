const express = require('express');
const server = express();
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { Server: WebSocketServer } = require('ws');
const db = require('./models/db');
const { dbHost } = require('./config.json');
const port = process.env.PORT || 3000;
const wss = new WebSocketServer({ port: 40510 });

server.listen(port, () => console.log(`Server listening at http://${dbHost}:${port}`));
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
        let data;
        message = JSON.parse(message);
        switch (message.type) {
            case 'create':
                data = await create(message).catch(e => {
                    console.log(new Date() + '| an error occurred during the creation of one or more database entries:');
                    console.error(e);
                });
                ws.send(JSON.stringify(data));
                break;
            case 'select':
                data = await select(message).catch(e => {
                    console.log(new Date() + '| an error occurred during the selection of one or more database entries:');
                    console.error(e);
                });
                ws.send(JSON.stringify(data));
                break;
            case 'update':
                await update(message).catch(e => {
                    console.log(new Date() + '| an error occurred during the updating of one or more database entries:');
                    console.error(e);
                });
                data = { update: true };
                ws.send(JSON.stringify(data));
                break;
            case 'delete':
                data = await destroy(message).catch(e => {
                    console.log(new Date() + '| an error occurred during the deletion of one or more database entries:');
                    console.error(e);
                });
                ws.send(JSON.stringify(data));
                break;
            default:
                throw new Error('database operation was not defined (this is a user-made error)');
        }
    });
});

// dynamic file serving
server.get('/', (req, res) => res.redirect('/index'));
server.get('/:path', (req, res) => {
    if (req.params.path.trim().toLowerCase().endsWith('.html')) return res.redirect(req.params.path.substring(0, req.params.path.length - 5));
    if (!req.session.user && req.params.path !== 'index') return res.redirect('/index');
    if (req.session.user && req.params.path === 'index') return res.redirect('/reservation-overview');
    const url = path.join(`${__dirname}/views/${req.params.path}.ejs`);
    if (fs.existsSync(url) && req.session.user) res.render(url, { username: req.session.user.username });
    else if (fs.existsSync(url)) res.render(url);
    else res.redirect('/page-not-found');
});

// posts for actions

// authenticate the user who tries to login
server.post('/authenticate', (req, res) => {
    const { username, password } = req.body;
    db.users.findOne({ where: { userName: username }}).then((user) => {
        if (!user) {
            console.log("Username or password is incorrect");
            res.redirect('/');
        } else {
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) throw err;
                if (!result) {
                    console.log("Username or password is incorrect");
                    res.redirect('/');
                } else {
                    req.session.user = {
                        id: user.id,
                        username: user.userName,
                        superUser: user.superUser
                    };
                    res.redirect('/reservation-overview');
                }
            });
        }
    });
});

// logout
server.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/index');
});

/* 
    since we don't use partials in this project,
    the pop-up partial will be retrieved in the view by a post request
*/
server.post('/reservation-pop-up', (req, res) => {
    const html = res.render(path.join(`${__dirname}/models/reservation-pop-up.ejs`), { node: req.body });
    res.send(html);
});

// other functions
function create({ table, options, values }) {
    console.log(`${new Date()} | creating entry in ${table}...`);
    return db[table].create(values, options);
}
function select({ table, options }) {
    console.log(`${new Date()} | fetching ${options.limit || 'all'} entries from ${table}...`);
    return db[table].findAll(options);
}
function update({ table, options, values }) {
    console.log(`${new Date()} | updating entries from ${table}...`);
    return db[table].update(values, options);
}
function destroy({ table, options }) {
    console.log(`${new Date()} | deleting entries from ${table}...`);
    return db[table].destroy(options);
}