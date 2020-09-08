const mongoose = require('mongoose');

const UserSchema = new  mongoose.Schema({
    username:{
        type:String
    },
    regno:{
        type:String
    }
})

module.exports = mongoose.model('Users',UserSchema);