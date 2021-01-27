var express = require('express')
var app = express()
var serv = require('http').Server(app)
var io = require('socket.io')(serv,{})

//file communication
app.get('/', function(req,res){
    res.sendFile(__dirname+'/client/index.html')
})

app.use('/client', express.static(__dirname+'client'))

serv.listen(3000, function(){
    console.log('connected on localhost 3000')
})

//server com
io.sockets.on('connection', function(socket){
    console.log('Socket Connected')

    socket.on('sendMsg', function(data){
        console.log(data.message);
    })

    socket.on('sendBtnMsg', function(data){
        console.log(data.message);
    })

    socket.emit('messageFromServer',{
        message:'hello'
    })
})