var express = require('express')
var mongoose = require('mongoose')
var app = express()
var path = require('path')
var bodyparser = require('body-parser')



app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/gameEntries',{
    useNewUrlParser:true
}).then(function(){
    console.log("Connected to monogDB Database")
}).catch(function(err){
    console.log("error")
})

require('./models/Game')
var Game = mongoose.model('game')

//example
/* var game = new Game({nameofgame:"Skyrim"})
game.save().then(function(){
    console.log("Game Saved")
}) */


app.post('/saveGame', function(req,res){
    console.log("Request Made")
    console.log(req.body)

    new Game(req.body).save().then(function(){
        res.redirect('gameList.html')
    })
    
})

app.get('/getData', function(req,res){
    Game.find({}).then(function(game){
        res.json({game})
    })
})

app.post('/deleteGame', function(req,res){
    console.log("Game Deleted", req.body._id)
    Game.findByIdAndDelete(req.body._id).exec()
    res.redirect('gamelist.html')
})


app.use(express.static(__dirname+"/views"))
app.listen(3000, function(){
    console.log("Listening on port 3000")
})
