const express = require('express');
const server = express();
const port = process.env.PORT || 3000;
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const { Server: WebSocketServer } = require('ws');
const db = require('./models/db');
const wss = new WebSocketServer({ port: 40510 });

// express initialisation
server.listen(port, () => console.log(`Server listening at ${port}`));
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
server.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// posts for actions
server.post('/authenticate', (req, res) => {
    db.users.findOne({ where: { userName: req.body.username }}).then((user) => {
        if (!user) {
            console.log("Username or password is incorrect");
            res.redirect('/');
        } else {
            bcrypt.compare(req.body.password, user.password, (err, result) => {
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

server.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/index');
});


// websocket
wss.on('connection', ws => {
    ws.on('message', async message => {
        let data;
        message = JSON.parse(message);
        switch (message.type) {
            case 'create':
                data = await create(message);
                ws.send(JSON.stringify(data));
                break;
            case 'select':
                data = await select(message);
                ws.send(JSON.stringify(data));
                break;
            case 'update':
                data = await update(message);
                ws.send(JSON.stringify(data));
                break;
            case 'delete':
                data = await destroy(message);
                ws.send(JSON.stringify(data));
                break;
            default:
                throw new Error('database operation was not defined');
        }
    });
});

// dynamic file serving
server.get('/', (req, res) => res.redirect('/index'));
server.get('/:path', (req, res) => {
    if (req.params.path.trim().toLowerCase().endsWith('.html')) return res.redirect(req.params.path.substring(0, req.params.path.length - 5));
    if (!req.session.user && req.params.path !== 'index') return res.redirect('/index');
    const url = path.join(`${__dirname}/views/${req.params.path}.ejs`);
    if (fs.existsSync(url)) res.render(url);
    else res.redirect('/page-not-found');
});

async function create({ table, options }) {}
async function select({ table, options }) {
    return await db[table].findAll(options).catch(e => console.error(e));
}
async function update({ table, options, values }) {}
async function destroy({ table, options }) {}