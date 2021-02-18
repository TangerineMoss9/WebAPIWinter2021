var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var BugSchema = new Schema({
    Game_Name:{
        type:String,
        required:true
    },
    Reporter:{
        type:String,
        required:true
    },
    Bug_Type:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    Status:{
        type:String,
        required:true
    },
})

mongoose.model('bug', BugSchema)