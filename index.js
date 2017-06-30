var express = require('express')
var app = express()

var ipc=require('node-ipc');

ipc.config.id   = 'hello';
ipc.config.retry= 1500;

ipc.connectTo(
    'world',
    function(){
        ipc.of.world.on(
            'connect',
            function(){
                ipc.log('## connected to world ##'.rainbow, ipc.config.delay);
                ipc.of.world.emit(
                    'message',  //any event or message type your server listens for
                    'hello'
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
                ipc.log('got a message from world : '.debug, data);
            }
        );
    }
);

app.get('/', function (req, res) {
    var key = req.query.key;
    var key = req.query.value;
    var o = {}
	ipc.of.world.emit(
		'message',
        o[key] = value
	);
	res.send(req.query.key + " " + req.query.value);
})
 
app.listen(8080)
