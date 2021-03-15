var express = require('express')
const { setFlagsFromString } = require('v8')
var app = express()
var mongoose = require('mongoose')
var serv = require('http').Server(app)
var io = require('socket.io')(serv, {})
var debug = true
require('./db')
require('./models/Player')


//game declairations

//var timer = requestAnimationFrame(main);

var asteroids = new Array();
var numAsteroids = 10;
var gameOver = true;
var score = 0;
var gameStates = [];
var currentState = 0;
var isPlaying = false;
var gravity = 1;
var p =0
// var bgMain = new Image();
// var cookieSprite = new Image();
// bgMain.src = "images/rocks.jpg";
// cookieSprite.src = "images/cookie.png";



var PlayerData = mongoose.model('player')


//File Communication===================================
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html')
})

app.use('/client', express.static(__dirname + '/client'))




//server side communiction=========================
serv.listen(3000, function () {
    console.log('Connected on localhost 3000')
})


function gameStart() {
    //for loop to create all instances of asteroids


}


var SocketList = {}
//var PlayerList = {}

//Class for GameObject
var GameObject = function () {
    var self = {
        x: 400,
        y: 300,
        spX: 0,
        spY: 0,
        id: ""
    }

    self.update = function () {
        self.updatePosition()
    }
    self.updatePosition = function () {
        self.x += self.spX
        self.y += self.spY
    }
    self.getDist = function (point) {
        return Math.sqrt(Math.pow(self.x - point.x, 2) + Math.pow(self.y - point.y, 2))
    }
    return self
}

var Player = function (id) {

    var self = GameObject()
    self.id = id
    self.number = Math.floor(Math.random() * 10)
    self.right = false
    self.left = false
    self.up = false
    //self.down = false
    //self.attack = false
    //self.mouseAngle = 0
    self.speed = 5
    self.width = 20
    self.height = 20
    self.vx = 0
    self.vy = 0
    self.flameLength = 30

    var playerUpdate = self.update

    self.update = function () {
        self.updateSpeed()
        playerUpdate()
        // if(Math.random()<0.1){
        //     self.shoot(Math.random()*360)
        // }
        if (self.attack) {
            self.shoot(self.mouseAngle)
        }
    }

    self.shoot = function (angle) {
        var b = Asteroid(self.id, angle);
        b.x = self.x
        b.y = self.y
    }

    self.updateSpeed = function () {
        if (self.right && self.x < 780) {
            self.spX = self.speed
        } else if (self.left && self.x > 0) {
            self.spX = -self.speed
        } else {
            self.spX = 0
        }

        if (self.up && self.y > 20) {
            self.spY = -self.speed

        } else {
            if (self.y < 580) {
                self.spY = 3
            }
            else {
                self.spY = 0
            }
        }
    }

    Player.list[id] = self

    return self
}

Player.list = {}

//list of functions for player connection and movement
Player.onConnect = function (socket) {

    var player = new Player(socket.id)
    p+=1

    //recieves player input
    socket.on('keypress', function (data) {
        //console.log(data.state)
        if (data.inputId === 'up')
            player.up = data.state
        if (data.inputId === 'down')
            player.down = data.state
        if (data.inputId === 'left')
            player.left = data.state
        if (data.inputId === 'right')
            player.right = data.state
        if (data.inputId === 'enter') {
            if (isPlaying == false) {
                Asteroid.Create()
            }
            isPlaying = true

        }

    })
}

Player.onDisconnect = function (socket) {
    delete Player.list[socket.id]
}

Player.update = function () {
    var pack = []

    for (var i in Player.list) {
        var player = Player.list[i]
        player.update()
        //console.log(player)
        pack.push({
            x: player.x,
            y: player.y,
            number: player.number,
            id: player.id
        })
    }

    return pack
}

function randomRange(high, low) {
    return Math.random() * (high - low) + low;
}

var Asteroid = function () {
    var self = GameObject()
    self.radius = randomRange(15, 2);
    self.x = randomRange(0 + self.radius, 800 - self.radius);
    self.y = randomRange(0 + self.radius, 600 - self.radius) - 600;

    self.id = Math.random()
    self.spX = 0;
    self.spY = randomRange(10, 5);
    self.color = "white";



    var asteroidUpdate = self.update
    self.update = function () {

        asteroidUpdate()
        for (var i in Player.list) {
            var p = Player.list[i]
            if (self.getDist(p) < 25 && self.parent !== p.id) {

                //damage or hp for health


            }
        }
    }
    Asteroid.list[self.id] = self
    return self
}
Asteroid.list = {}

function detectCollision(distance, calcDistance) {
    return distance < calcDistance;
}

Asteroid.update = function () {
    //creates bullets
    // if(Math.random()<0.1){
    //     Bullet(Math.random()*360)
    // }
    var pack = []

    for (var i in Asteroid.list) {
        var asteroid = Asteroid.list[i]
        asteroid.update()
        


        for (var j in Player.list) {
            var plr = Player.list[j]
            

            var dX = plr.x - asteroid.x;
            var dY = plr.y - asteroid.y;
            var dist = Math.sqrt((dX * dX) + (dY * dY));
            

            if (detectCollision(dist, (plr.height + asteroid.radius))) {
                console.log(i, "hit")
                delete Player.list[j]
                p-=1
                if(p == 0){
                    console.log("game over")
                    for (var o in Asteroid.list) {
                        delete Asteroid.list[o]
                    }
                    isPlaying = false;

                }
            }
        }



        if (asteroid.y > 620) {
            asteroid.radius = randomRange(15, 2);
            asteroid.x = randomRange(0 + asteroid.radius, 800 - asteroid.radius);
            asteroid.y = -25;
            asteroid.spY = randomRange(5, 1);
        }


        if (asteroid.toRemove) {
            delete Asteroid.list[i]
        }
        else {
            pack.push({
                x: asteroid.x,
                y: asteroid.y,
                radius: asteroid.radius
            })
        }

    }

    return pack
}

Asteroid.Create = function () {
    //var asteroids = new Asteroid();
    for (var i = 0; i < numAsteroids*p; i++) {
        asteroids[i] = new Asteroid();
    }
}
///====== User Collection setup

var Players = {
    "Matt": "123",
    "Rob": "asd",
    "Ron": "321",
    "Jay": "ewq",
}

var isPasswordValid = function (data, cb) {
    PlayerData.findOne({ username: data.username }, function (err, username) {
        console.log(username.password, data.password)
        cb(data.password == username.password)
    })


    //return Players[data.username] === data.password
}

var isUsernameTaken = function (data) {

    return Players[data.username]
}

var addUser = function (data) {
    //Players[data.username] = data.password
    new PlayerData(data).save()

}


//Connection to game
io.sockets.on('connection', function (socket) {
    console.log("Socket Connected")

    socket.id = Math.random()
    // socket.x = 0
    // socket.y = Math.floor(Math.random()*600)
    // socket.number = Math.floor(Math.random()*10)
    //add something to SocketList
    SocketList[socket.id] = socket



    //signIn event
    socket.on('signIn', function (data) {

        // if(isPasswordValid(data)){
        //    Player.onConnect(socket)
        //     //send the id to the client
        //     socket.emit('connected', socket.id)
        //     socket.emit('signInResponse',{success:true}) 
        // }else{
        //     socket.emit('signInResponse',{success:false}) 
        // }

        isPasswordValid(data, function (res) {
            if (res) {
                Player.onConnect(socket)
                

                socket.emit('connected', socket.id)
                socket.emit('signInResponse', { success: true })
            } else {
                socket.emit('signInResponse', { success: false })
            }
        })
    })

    //signUp event
    socket.on('signUp', function (data) {
        if (isUsernameTaken(data)) {
            socket.emit('signUpResponse', { success: false })
        } else {
            addUser(data)
            socket.emit('signUpResponse', { success: true })
        }
    })

    //disconnection event
    socket.on('disconnect', function () {
        delete SocketList[socket.id]
        Player.onDisconnect(socket)
    })

    //handleing chat event
    socket.on('sendMessageToServer', function (data) {
        console.log(data)
        var playerName = (" " + socket.id).slice(2, 7)
        for (var i in SocketList) {
            SocketList[i].emit('addToChat', playerName + ": " + data)
        }
    })

    socket.on('evalServer', function (data) {
        if (!debug) {
            return
        }
        var res = eval(data)
        socket.emit('evalResponse', res)
    })
    ///Old Examples from Wednesday 1/27
    // socket.on('sendMsg',function(data){
    //     console.log(data.message);
    // })
    // socket.on('sendBtnMsg',function(data){
    //     console.log(data.message)
    // })

    // socket.emit('messageFromServer',{
    //     message:'Hey Jordan Welcome to the party'
    // })
})

//Setup Update Loop 
setInterval(function () {
    var pack = {
        player: Player.update(),
        asteroid: Asteroid.update()
    }
    // var pack = Player.update();
    for (var i in SocketList) {
        var socket = SocketList[i]
        socket.emit('newPositions', pack)
    }
}, 1000 / 30)



//---Collision Detection Function---
function detectCollision(distance, calcDistance) {
    return distance < calcDistance;
}


//--Score Timer Function---
function scoreTimer() {
    if (gameOver == false) {
        score++;
        //using modulus divide the score by 5 and inf the remainder is zero addastteroids
        if (score % 5 == 0) {
            numAsteroids += 5;
            console.log(numAsteroids);
        }
        // console.log(score);
        setTimeout(scoreTimer, 1000);
    }
}

