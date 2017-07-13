var express = require('express')
var app = express()
var moment = require('moment');
var ipc  = require('node-ipc');
var firebase = require('firebase');

var lastAction = '';

ipc.config.id   = 'api';
ipc.config.retry= 1500;

const message = (type, payload = null) => {
    return {
        node: ipc.config.id,
        type: type,
        payload: payload
    }
}

ipc.connectTo(
    'world',
    function(){
        const addHistory = (key, value) => {
            var d = new Date();
            var o = {};
            o[key] = value;
            var refHistory = firebase.database().ref('device/0/archive/' + parseInt(d.getTime() / 1000)).set(o);
        }
        async function initFirebase(){

            var config = {
                apiKey: "AIzaSyDfwYRtBh8lgI10u2RvH_NC0aMPq3Jnf-M",
                authDomain: "fresh-mint-f5125.firebaseapp.com",
                databaseURL: "https://fresh-mint-f5125.firebaseio.com",
                projectId: "fresh-mint-f5125",
                storageBucket: "fresh-mint-f5125.appspot.com",
                messagingSenderId: "638729215739"
            };

            await firebase.initializeApp(config);

            var refCurrent = firebase.database().ref('device/0/current');

            refCurrent.on('value', (snapshot) => {
                if (ipc.of && ipc.of.world){
                    var updatedObject = snapshot.val();
                    var keys = Object.keys(updatedObject);
                    for (var i in keys){
                        var key = keys[i];
                        var value = updatedObject[key];
                        ipc.of.world.emit('message', message('board', {key: key, value: value}));
                        addHistory(key, value);
                    }
                }
            });
        }
        initFirebase();  

        ipc.of.world.on(
            'connect',
            function(){
                ipc.of.world.emit(
                    'message',  //any event or message type your server listens for
                    message('connect')
                )
            }
        );
        ipc.of.world.on(
            'message',  //any event or message type your server listens for
            function(data){
                if (data.node == "board" && data.type == "api"){
                    var {payload} = data;
                    lastAction = `pin: ${payload.pin}; value: ${payload.value}`;
                    if (payload) {
                        addHistory(payload.pin, payload.value)
                    }
                }
            }
        );
    }
);

const correctValue = (value) => {
    if (!value){
        return false;
    }

    if (value.indexOf(',') !== -1){
        return value.split(',');
    } else if (value === "false"){
        return false
    } else if (value === "true"){
        return true
    }

    return true
}

app.get('/', function (req, res) {
    var key = req.query.key;
    var value  = req.query.value;
    value = correctValue(value);
    if (ipc.of && ipc.of.world){
	    ipc.of.world.emit('message', message('board', {key, value}));
    }
	res.send(lastAction);
})
 
app.listen(8090)