const Librus = require("librus-api");
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const uuid = require('uuid4');

app.set({
    'Content-Type': 'text/html',
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.send(fs.readFileSync("src/web/librus.html", { encoding: 'utf-8' }));
});

let clients = {};

app.get('/api/grades', async (req, res) => {
    clients[req.cookies.cid].info.getGrades().then(data => {
        res.send(JSON.stringify(data));
    });
});

app.get('/api/grade/:id', async (req, res) => {
    clients[req.cookies.cid].info.getGrade(req.params.id).then(data => {
        res.send(JSON.stringify(data));
    });
});

app.get('/api/am_i_valid', async (req, res) => {
    res.send(req.cookies.cid in clients);
});
app.post('/api/auth', async (req, res) => {
    let c = new Librus();
    let cid = uuid();
    console.log("Login attempt from "+req.body.user);
    if(req.body.user==undefined||req.body.pass==undefined){
        res.status(405).send("Method Not Allowed");
        return;
    }
    c.authorize(req.body.user, req.body.pass).then(async (r) => {
        if(c==undefined){
            res.status(500).send("Internal Server Error");
            return;
        }
        let acc = await c.info.getAccountInfo();
        if(acc.account.login==''){
            res.status(401).send("Unauthorized");
            return;
        }
        res.send(cid);
        clients[cid] = c;
        return;
    });
});

app.get('/api/timetable', async (req, res) => {
    clients[req.cookies.cid].calendar.getTimetable().then(data => {
        res.send(JSON.stringify(data));
    });
});

app.post('/api/logout', async (req, res) => {
    if(req.body.cid in clients){
        delete clients[req.body.cid];
    }
    res.send();
});

app.listen(process.env.PORT || 3000);