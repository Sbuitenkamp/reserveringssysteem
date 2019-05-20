const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const { Server: WebSocketServer } = require('ws');
const { reservations, guests, items, objects } = require('./models/db');
const wss = new WebSocketServer({ port: 40510 });
const app = express();
const port = process.env.PORT || 3000;

// express initialisation
app.listen(port, () => console.log(`Server listening at http://localhost:${port}`));
app.use(express.static(`${__dirname}/controllers`));
app.use(express.static(`${__dirname}/styles`));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'yrla is thicc af',
    resave: true,
    saveUninitialized: true
}));

// websocket
wss.on('connection', ws => {
    ws.on('message', message => console.log('received: %s', message));
    ws.send();
});

// dynamic file serving
app.get('/', (req, res) => res.redirect('/index'));
app.get('/:path', (req, res) => {
    if (req.params.path.trim().toLowerCase().endsWith('.html')) return res.redirect(req.params.path.substring(0, req.params.path.length - 5));
    const url = path.join(`${__dirname}/views/${req.params.path}.html`);
    if (fs.existsSync(url)) {
        fs.readFile(url, (err, data) => {
            if (err) throw err;
            res.end(data);
        });
    } else res.send('404 Page not found');
});