const mongoose = require('mongoose')

const urlSchema = new mongoose.Schema({
    username: String,
    from: Date,
    to: Date,
    log: [{
        description: String,
        duration: Number,
        date: Date
    }]
  });

  module.exports = mongoose.model('User', urlSchema)

