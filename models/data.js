const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const DataSchema = new Schema({
    persontemp: {
        val: Number,
        timestamp: Number
    },
    distance: {
        val: Number,
        timestamp: Number
    },
    garbagelevel: {
        val: Number,
        timestamp: Number
    },
    elevator: {
        val: Number,
        timestamp: Number
    },
    colevel: {
        val: Number,
        timestamp: Number
    },
    temp: {
        val: Number,
        timestamp: Number
    }
});


module.exports = mongoose.model('Data', DataSchema);