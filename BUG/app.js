var express = require('express')
var mongoose = require('mongoose')
var app = express()
var path = require('path')
var bodyparser = require('body-parser')



app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/bugEntries',{
    useNewUrlParser:true
}).then(function(){
    console.log("Connected to monogDB Database")
}).catch(function(err){
    console.log("error")
})

require('./models/Bug')
var Bug = mongoose.model('bug')

//example
/* var game = new Game({nameofgame:"Skyrim"})
game.save().then(function(){
    console.log("Game Saved")
}) */


app.post('/saveBug', function(req,res){
    console.log("Request Made")
    console.log(req.body)

    new Bug(req.body).save().then(function(){
        res.redirect('buglist.html')
    })
    
})

app.get('/getData', function(req,res){
    Bug.find({}).then(function(bug){
        res.json({bug})
    })
})

app.post('/deleteBug', function(req,res){
    console.log("Bug Deleted", req.body._id)
    Bug.findByIdAndDelete(req.body._id).exec()
    res.redirect('index.html')
})




app.use(express.static(__dirname+"/views"))
app.listen(3000, function(){
    console.log("Listening on port 3000")
})
