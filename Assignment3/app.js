var express = require('express')
var mongoose = require('mongoose')
var app = express()
var path = require('path')
const { setFlagsFromString } = require('v8')
var bodyparser = require('body-parser')
var serv = require('http').Server(app)
var io = require('socket.io')(serv,{})
var debug = true




app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))
app.use(express.json())

serv.listen(3000,function(){
    console.log('Connected on localhost 5000')
})


mongoose.connect('mongodb://localhost:27017/HighScores', {
    useNewUrlParser: true
}).then(function () {
    console.log("Connected to monogDB Database")
    var mysort = { score: 1 };
    
}).catch(function (err) {
    console.log("error")
})

require('./models/Score')
var Score = mongoose.model('score')

app.post('/saveScore', function (req, res) {
    console.log("Request Made")
    console.log(req.body)

    new Score(req.body).save().then(function () {
        res.redirect('/scoreList.html')
    })
    

})

app.get('/getData', function (req, res) {
    Score.find({}).then(function (score) {
        res.json({ score })
    })
})

io.sockets.on('connection', function(socket){
    console.log("Socket Connected")

    socket.id = Math.random()
   // socket.x = 0
   // socket.y = Math.floor(Math.random()*600)
   // socket.number = Math.floor(Math.random()*10)
    //add something to SocketList
    SocketList[socket.id] = socket
})


app.use(express.static(__dirname + "/views"))
app.listen(5000, function () {
    console.log("Listening on port 5000")
})

var SocketList = {}
//var PlayerList = {}

//Class for GameObject
var GameObject = function(){
    var self = {
        x:400,
        y:300,
        spX:0,
        spY:0,
        id:""
    }
    
    self.update= function(){
        self.updatePosition()
    }
    self.updatePosition = function(){
        self.x += self.spX
        self.y += self.spY
    }
    self.getDist = function(point){
        return Math.sqrt(Math.pow(self.x - point.x,2)+Math.pow(self.y-point.y,2))
    }
    return self
}

var Player =function(id){
    
    var self = GameObject()
    self.id = id
    self.number = Math.floor(Math.random()*10)
    self.right = false
    self.left = false
    self.up = false
    self.down = false
    self.attack = false
    self.mouseAngle = 0
    self.speed = 10
    
    var playerUpdate = self.update

    self.update = function(){
        self.updateSpeed()
        playerUpdate()
        // if(Math.random()<0.1){
        //     self.shoot(Math.random()*360)
        // }
        if(self.attack){
            self.shoot(self.mouseAngle)
        }
    }

    self.shoot = function(angle){
        var b = Bullet(self.id,angle);
        b.x = self.x
        b.y = self.y
    }

    self.updateSpeed = function(){
        if(self.right){
            self.spX = self.speed
        }else if(self.left){
            self.spX = -self.speed
        }else{
            self.spX = 0
        }

        if(self.up){
            self.spY = -self.speed
        }else if(self.down){
            self.spY = self.speed
        }else{
            self.spY = 0
        }
    }

    Player.list[id] = self

    return self
}

Player.list = {}

//list of functions for player connection and movement
Player.onConnect = function(socket){
    
    var player = new Player(socket.id)
    
    
    //recieves player input
    socket.on('keypress',function(data){
        //console.log(data.state)
        if(data.inputId === 'up')
            player.up = data.state
        if(data.inputId === 'down')
            player.down = data.state
        if(data.inputId === 'left')
            player.left = data.state
        if(data.inputId === 'right')
            player.right = data.state
        if(data.inputId === 'attack')
            player.attack = data.state
        if(data.inputId === 'mouseAngle')
            player.mouseAngle = data.state
    })
}






Player.onDisconnect = function(socket){
    delete Player.list[socket.id]
}

Player.update = function(){
    var pack = []
   
    for (var i in Player.list) {
        var player = Player.list[i]
        player.update()
        //console.log(player)
        pack.push({
            x: player.x,
            y: player.y,
            number:player.number,
            id:player.id 
        })
    }

    return pack
}

io.sockets.on('connection', function(socket){
    console.log("Socket Connected")

    socket.id = Math.random()
   
    SocketList[socket.id] = socket
   
      
    
    //disconnection event
    socket.on('disconnect',function(){
        delete SocketList[socket.id]
        Player.onDisconnect(socket)
    })

    //handleing chat event
    socket.on('sendMessageToServer',function(data){
        console.log(data)
       var playerName = (" " + socket.id).slice(2,7)
       for(var i in SocketList){
           SocketList[i].emit('addToChat', playerName + ": "+ data)
       }
    })

    
   
})