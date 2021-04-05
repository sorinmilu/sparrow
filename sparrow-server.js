var server = require('websocket').server;
var http = require('http');
require('dotenv').config();


var socket = new server({
    httpServer: http.createServer().listen(1337)
});

var tagCount = require('./lib/tag-count');
var TC;

//se executa la deschiderea unei conexiuni de tip websocket
//socket va declanșa o serie de evenimente la care vom raspunde cu funcții
socket.on('request', function(request) {
    var connection = request.accept(null, request.origin);

    var TC = new tagCount({
         "consumer_key":         process.env.consumer_key,
         "consumer_secret":      process.env.consumer_secret,
         "access_token":         process.env.access_token,
         "access_token_secret":  process.env.access_token_secret,
         "timeout": process.env.timeout
     });

    //se executa la primirea unui mesaj pe socket
    connection.on('message', function(message) {
        var received = JSON.parse(message.utf8Data);
        //daca s-a primit comanda startCollection incepe colectarea datelor
        if (received.command == 'startCollection') {
            tagsarray = received.tagsarray;
            var interval = '2 seconds';
            var finalCount = {};
            //finalcount este matricea in care se vor acumula rezultatele pe masura ce vin de la tagCount
            tagsarray.forEach(function (hashtag) {
                finalCount[hashtag] = 0;
            });

            //definim callbackurile necesare pentru tagCount

            //intervalCb este funcția care va fi executat de tagCount la finalul unui interval de colectare
            var intervalCb = function (err, results, twcount, langs) {
                if (err) {
                    console.error(err);
                } else {
                    // console.log('twcount here' + twcount);
                    tagsarray.forEach(function (tag) {
                        finalCount[tag] += results[tag];
                    });
                    connection.sendUTF(JSON.stringify({'dt': 'data', 'data': finalCount, 'langs': langs, 'twcount' : twcount}));
                }
            };

            //connectingCb este functia care va fi executata la deschiderea conexiunii catre API-ul Twitter
            var connectingCb = function () {
                var dateString = new Date().toISOString();
                console.log(dateString + ' Connecting to Twitter Streaming API...');
                connection.sendUTF(JSON.stringify({'dt': 'msg', 'message': 'Conectare la Twitter Streaming API...'}));
            };

            //reconnectingCb este functia care va fi executata in cazul in care trebuie refacuta conexiunea catre API-ul Twitter
            var reconnectingCb = function () {
                var dateString = new Date().toISOString();
                console.log(dateString + ' Twitter Streaming API connection failed. Reconnecting...');
                connection.sendUTF(JSON.stringify({'dt': 'msg', 'message': 'Twitter Streaming API connection failed. Reconnecting...'}));
            };

            //connectedCb este functia care va fi executata la finalizarea cu succes a conexiunii catre twitter
            var connectedCb = function () {
                var dateString = new Date().toISOString();
                console.log(dateString + ' Connected.');
                connection.sendUTF(JSON.stringify({'dt': 'msg', 'message': 'Conexiune realizata...'}));
            };

            //finishedCb este functia care va fi executata la inchiderea conexiunii catre API-ul Twitter
            var finishedCb = function () {
                var dateString = new Date().toISOString();
                connection.sendUTF(JSON.stringify({'dt': 'msg', 'message': 'Colectarea s-a terminat...'}));
            };

            var limit = '5 minutes';

            //aici se porneste colectarea datelor
            TC.start({
                tagsarray: tagsarray,
                interval: interval,
                limit: limit,
                intervalCb: intervalCb,
                connectingCb: connectingCb,
                reconnectingCb: reconnectingCb,
                connectedCb: connectedCb,
                finishedCb: finishedCb
            });

        //s-a primit comanda stopCollection, oprim colectarea datelor
        } else if (received.command == 'stopCollection') {
            console.log('Stop collection received');
            TC.stop();
        }
    });

    //eveniment declansat la inchiderea (de catre client) a conexiunii websocket
    connection.on('close', function(connection) {
        console.log('connection closed');
        TC.stop();
    });
});
