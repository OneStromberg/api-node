var express = require('express')
var app = express()
var moment = require('moment');
var ipc  =require('node-ipc');

ipc.config.id   = 'api';
ipc.config.retry= 1500;

var logout = "";

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
        ipc.of.world.on(
            'connect',
            function(){
                ipc.log('## connected to world ##'.rainbow, ipc.config.delay);
                ipc.of.world.emit(
                    'message',  //any event or message type your server listens for
                    message('connect')
                )
            }
        );
        ipc.of.world.on(
           'disconnect',
            function(){
                ipc.log('disconnected from world'.notice);
            }
        );
        ipc.of.world.on(
            'message',  //any event or message type your server listens for
            function(data){
                if (data.node == "board" && data.type == "api"){
                    var {payload} = data;
                    console.log('data', data);
                    if (payload) {
                        var d = new Date();
                        logout+= '<div><span>date: ' + moment(d).format('MMMM Do hh:mm:ss') + ';</span><span> pin: ' + payload.pin + ';</span><span> value:' + payload.value + ';</span></div></br>'
                    }
                }
                ipc.log('got a message from world : '.debug, data);
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
	res.send(logout);
})
 
app.listen(8090)
