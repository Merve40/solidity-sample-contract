var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var fs = require('fs');

// app configurations
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/demo/index.html'));
});

app.get('/index.js', (req, res) => {
    res.sendFile(path.join(__dirname + '/demo/js/index.js'));
});

app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname + '/demo/css/style.css'));
});

app.get('/web3.js', (req, res) => {
    res.sendFile(path.join(__dirname + '/node_modules/web3/dist/web3.min.js'));
});

app.get('/bootstrap', (req, res) => {
    res.sendFile(path.join(__dirname + '/node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'));
});

app.get('/bootstrap-css', (req, res) => {
    res.sendFile(path.join(__dirname + '/node_modules/bootstrap/dist/css/bootstrap.min.css'));
});

app.get('/jquery', (req, res) => {
    res.sendFile(path.join(__dirname + '/node_modules/jquery/dist/jquery.min.js'));
});

app.get('/contract', (req, res) => {
    //res.sendFile(path.join(__dirname + '/node_modules/jquery/dist/jquery.min.js'));
    fs.readFile(path.join(__dirname + '/build/contracts/Reenrolment.json'), 'utf8', (err,data)=>{
        if(err){
            throw err;
        }
        var abi = JSON.parse(data).abi;

        fs.readFile(path.join(__dirname + '/contractAddress.js'), 'utf8', (e,result)=>{
            if(e)
                throw e;
            
            var content = "var abi = "+JSON.stringify(abi)+";"
            content +=result;
            res.setHeader('Content-Type', 'application/javascript');
            res.send(content);
        });


       
    });
});



app.listen(8181);
console.log("demo running on localhost on port 8181");
