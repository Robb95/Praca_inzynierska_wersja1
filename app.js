var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.get('/', function(req,res) {
  res.sendfile('index.html');
});



//Funkcja do generowania wartości prędkości wiatru
function randomNumber(low,high)
{
  return Math.floor(Math.random() * (high - low+1)+low);
};
//------------------------------------------------------


//Aktualizacja użytkowników po stronie serwera
const activeUsers = new Set();
io.on("connection", function (socket) {
   
   socket.on("new user", function (data) {
    console.log("Made socket connection");
    socket.userId = data;
    activeUsers.add(data);
    io.emit("new user", [...activeUsers]);
    console.log([...activeUsers]);
   });
   
   socket.on("disconnect", () => {
    console.log("User disconnected");
    activeUsers.delete(socket.userId);
    io.emit("user disconnected", socket.userId);
    console.log([...activeUsers]);
   }); 
});
//------------------------------------------------------



//Generowanie wyników pomiarów, wysyłanie do klientów i zapis do archiwum.txt
var fs = require("fs");
setInterval(function() {
   fs.readFile("./wczytaj.txt", function(text){
     var text = fs.readFileSync("./wczytaj.txt").toString('utf-8');
     fs.appendFile("./archiwum.txt",text+"\r\n",err=>{
      if(err===null){
        //Zapis do archiwum
      }
      else 
      {
        console.log("Error");
      }
   });

    //Jeżeli plik nie jest pusty wysyła wartość do użytkownika
     if(text.length!=0){
        io.emit('testerEvent', text); 
     }
     
      //Pobieranie daty i godziny 
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); 
      var yyyy = today.getFullYear();
      var curHour = today.getHours() > 12 ? today.getHours() - 12 : (today.getHours() < 10 ? "0" + today.getHours() : today.getHours());
	    var curMinute = today.getMinutes() < 10 ? "0" + today.getMinutes() : today.getMinutes();
	    var curSeconds = today.getSeconds() < 10 ? "0" + today.getSeconds() : today.getSeconds();
     

    //Wpisywanie wartości wygenerowanej do pliku wczytaj.txt
     fs.writeFile("./wczytaj.txt", randomNumber(10,99)+" "+ "[km/h]"+" "+mm + '/' + dd + '/' + yyyy+"r. "+"godzina: "+curHour + ':' + curMinute + ':' + curSeconds ,err=>{
      if(err===null){
      }
      else 
      {
        console.log("Error");
      }
    });
 
 });
}, 5000); //Odstępy generowanych pomiarów to 5s

http.listen(3000, function() {console.log('Listening on localhost:3000');
});