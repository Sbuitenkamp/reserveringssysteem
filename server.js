const express = require('express');
const server = express();
const port = process.env.PORT || 3000;
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { Server: WebSocketServer } = require('ws');
const db = require('./models/db');
const wss = new WebSocketServer({ port: 40510 });
// const browserSync = require('browser-sync');
// const bs = browserSync.create().init({ proxy: `localhost:${port}`, watch: true, files: '**/*', logSnippet: false });
// const bsConnect = require('connect-browser-sync')(bs, { injectHead: true });

// express initialisation
server.listen(port, () => console.log(`Server listening at http://localhost:${port}`));
server.set('view engine', 'ejs');
server.use(express.static(`${__dirname}/controllers`));
server.use(express.static(`${__dirname}/styles`));
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());
server.use(session({
    secret: 'yrla is thicc af',
    resave: false,
    saveUninitialized: false
}));

// websocket
wss.on('connection', ws => {
    console.log('fuck');
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
            case 'authenticate':
                ws.on('message', async message => {
                    const auth = await message;
                    ws.send(JSON.stringify(auth));
                    console.log(`koeien in de sloot | ${auth} | paard in de hei`);
                });
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
    if(!req.session.user && req.params.path !== 'index') return res.redirect('/index');
    const url = path.join(`${__dirname}/views/${req.params.path}.ejs`);
    if (fs.existsSync(url)) {
        res.render(url);
    } else {
        res.status(200);
        res.redirect('/page-not-found')
    }
});

async function create({ table, options }) {}
async function select({ table, options }) {
    return await db[table].findAll(options).catch(e => console.error(e));
}
async function update({ table, options, values }) {}
async function destroy({ table, options }) {}