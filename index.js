const { exec } = require("child_process");
const fs = require('fs');
const parseString = require('xml2js').parseString;
const express = require('express')
const xml2js = require('xml2js');
const app = express()
const port = process.env.APP_PORT || 3000;
const publicZoneFilePath = process.env.PUBLIC_ZONE_PATH || 'example.xml'

app.use(express.urlencoded());
app.use(express.static(__dirname + '/views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.get('/', (req, res) => {res.redirect(302, '/public')});

app.get('/public', function(req, res){
    let openPorts = [];
    const xmlData = fs.readFileSync(publicZoneFilePath, 'utf8');
    parseString(xmlData, function (err, result) {
        if (result.zone['port'] == undefined) {
            return res.render('forward.html', {list: [], tab: 'public'});
        }

        result.zone['port'].forEach(function(element) {
            element = element['$'];
            openPorts.push({
                protocol: element['protocol'],
                port: element['port'],
            });
        });
        
        res.render('public.html', {list: openPorts, tab: 'public'});
    });
});

app.post('/public/create', function(req, res){ 
    let body = req.body;
    let openPorts = {};
    openPorts.$ = {
        'protocol': body.protocol,
        'port': body.port,
    }
    const xmlData = fs.readFileSync(publicZoneFilePath, 'utf8');
    parseString(xmlData, function (err, result) {
        if (result.zone['port'] == undefined) {
            result.zone['port'] = [];
        }
        result.zone['port'].push(openPorts);
        xmlString = (new xml2js.Builder()).buildObject(result);
        fs.writeFileSync(publicZoneFilePath, xmlString);
        res.redirect(302, '/public');
    });
});

app.get('/public/delete/:index', function(req, res){ 
    let index = req.params.index;
    const xmlData = fs.readFileSync(publicZoneFilePath, 'utf8');
    parseString(xmlData, function (err, result) {
        result.zone['port'].splice(index, 1);
        xmlString = (new xml2js.Builder()).buildObject(result);
        fs.writeFileSync(publicZoneFilePath, xmlString);
        res.redirect(302, '/public');
    });
});

app.get('/forward', function(req, res){
    let forwardedPorts = [];
    const xmlData = fs.readFileSync(publicZoneFilePath, 'utf8');
    parseString(xmlData, function (err, result) {
        if (result.zone['forward-port'] == undefined) {
            return res.render('forward.html', {list: [], tab: 'forward'});
        }

        result.zone['forward-port'].forEach(function(element) {
            element = element['$'];
            forwardedPorts.push({
                proto: element['protocol'],
                src_port: element['port'],
                dest_port: element['to-port'],
                dest_ip: element['to-addr'],
            });
        });
        res.render('forward.html', {list: forwardedPorts, tab: 'forward'});
    });
});

app.post('/forward/create', function(req, res){ 
    let body = req.body;
    let forwardRecord = {};
    forwardRecord.$ = {
        'to-port': body.dest_port,
        'to-addr': body.dest_ip,
        'protocol': body.protocol,
        'port': body.port,
    }
    const xmlData = fs.readFileSync(publicZoneFilePath, 'utf8');
    parseString(xmlData, function (err, result) {
        if (result.zone['forward-port'] == undefined) {
            result.zone['forward-port'] = [];
        }
        result.zone['forward-port'].push(forwardRecord);
        xmlString = (new xml2js.Builder()).buildObject(result);
        fs.writeFileSync(publicZoneFilePath, xmlString);
        res.redirect(302, '/forward');
    });
});


app.get('/forward/delete/:index', function(req, res){ 
    let index = req.params.index;
    const xmlData = fs.readFileSync(publicZoneFilePath, 'utf8');
    parseString(xmlData, function (err, result) {
        result.zone['forward-port'].splice(index, 1);
        xmlString = (new xml2js.Builder()).buildObject(result);
        fs.writeFileSync(publicZoneFilePath, xmlString);
        res.redirect(302, '/forward');
    });
});

app.get('/reload', function(req, res) {
    exec("firewall-cmd --reload", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(stdout);
        res.redirect(302, '/public');
    });
});

app.listen(port, () => {
  console.log(`Firewalld GUI is listening on port ${port}`)
  console.log(`Public Zone file path is ${publicZoneFilePath}`)
})