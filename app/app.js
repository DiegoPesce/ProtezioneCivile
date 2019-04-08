// moduli utilizzati dal progetto

var express = require('express');
var app = express();

const mongodb = require('mongodb').MongoClient;
const url = "mongodb+srv://admin:admin1234@cluster0-jss0e.mongodb.net/test?retryWrites=true{useNewUrlParser: true}";
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json())

const mysql = require('mysql');
// configurazione motore di render

app.set('views', './views');
app.set('view engine', 'pug');

// gestione della homepage

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/login.html');
});

app.post('/avvisa', function(req, res){
    var con = mysql.createConnection({
      host: "remotemysql.com",
      user: "wNgXnRCZBz",
      password: "LQLOj8jXYk",
      database: "wNgXnRCZBz"
    });
    
    con.connect(function(err) {
      if (err) throw err;
      con.query("SELECT * FROM users WHERE username='" + req.body.username +"' AND password='" + req.body.password + "'", 
            function (err, result, field) {
        if (err) throw err;
        if(result.length > 0){
            res.sendFile(__dirname + "/avvisa.html");
        }else{
            res.send("Vedi di non scherzare che ti sego le gambe e ti sparo sulla spina dorsale");
        }
      });
    });
});



// a differenza di quanto visto finora, si utilizza un server https,
// necessario perché altrimenti la geolocalizzazione non funziona

var fs = require('fs');
var https = require('https');

// per la creazione di un server https sono necessari una chiave (key) 
// ed un certificato (cert) per certificare il sito e quindi poter utilizzare
// https. Il seguente comando (digitato nel terminal)

// openssl req -nodes -new -x509 -keyout server.key -out server.cert

// permette al creazione di questi certificati che però,
// ovviamente, non vengono accettati dal browser ma permettojno ugualmente
// di utilizzare la geolocalizzazione


var server = https.createServer({
  key: fs.readFileSync(__dirname + '/server.key'),
  cert: fs.readFileSync(__dirname + '/server.cert')
}, app);

server.listen(3000, function () {
  console.log('Example app listening on port 3000! Go to https://localhost:3000/');
});

// cambia anche la sintassi per la creazione delle socket

var io = require('socket.io').listen(server);

io.on('connection', function(socket){ // gestisce le connessioni
  
  console.log('a user connected');  
  
  socket.on('segnalazione', function(msg){
    // parte del codice che gestisce la ricezione della segnalazione di un volontario e il successivo invio a tutti gli altri
    io.emit('segnalazione', msg);
     
    mongodb.connect(url, function(err, db) {
      if (err) throw err;
      var dbo = db.db("mydb");
      dbo.collection("ProtezioneCivile").insertOne(msg, function(err, res) {
        if (err) throw err;
        console.log("1 document inserted");
        db.close();
      })
    });
 
    // scrivere il codice per visualizzare su console le informazioni ricevute
    // e per spedire la segnalazione a tutti i volontari connessi ad eccezione del mittente
  });
  
  socket.on('disconnect', function(){ // quando viene ricevuto l'evento 'disconnect'
    console.log('user disconnected'); // viene visualizzato il messaggio che un utente si è disconnesso sulla console del server
  });
  
});
