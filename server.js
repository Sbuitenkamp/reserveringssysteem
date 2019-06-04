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
server.listen(port, () => console.log(`Server listening at http://localhost:${port}`));
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
    resave: true,
    saveUninitialized: true
}));

// posts for actions
server.post('/authenticate', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    db.users.findOne({ where: { userName: username }}).then((user) => {
        if(!user) {
            console.log("Username or password is incorrect");
            res.redirect('/');
        } else {
            bcrypt.compare(password, user.password, (err, result) => {
                if (err) return console.log(err);
                if (!result) {
                    console.log("Username or password is incorrect");
                    res.redirect('/');
                } else {
                    req.session.username = user.userName;
                    res.status(200);
                    res.redirect('/reservation-overview');
                    // console.log(req.session.username);
                }
            });
        }
    });
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
    const url = path.join(`${__dirname}/views/${req.params.path}.ejs`);
    if (fs.existsSync(url)) {
        res.render(url);
    }
});

async function create({ table, options }) {}
async function select({ table, options }) {
    return await db[table].findAll(options).catch(e => console.error(e));
}
async function update({ table, options, values }) {}
async function destroy({ table, options }) {}