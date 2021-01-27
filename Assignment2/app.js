var express = require('express')
var mongoose = require('mongoose')
var app = express()
var path = require('path')
var bodyparser = require('body-parser')




app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/HighScores',{
    useNewUrlParser:true
}).then(function(){
    console.log("Connected to monogDB Database")
}).catch(function(err){
    console.log("error")
})

require('./models/Score')
var Score = mongoose.model('score')

app.post('/saveScore', function(req,res){
    console.log("Request Made")
    console.log(req.body)
    
    new Score(req.body,req.body).save()
    
})

app.get('/getData', function(req,res){
    Score.find({}).then(function(score){
        res.json({score})
    })
})




app.use(express.static(__dirname+"/views"))
app.listen(5000, function(){
    console.log("Listening on port 5000")
})


