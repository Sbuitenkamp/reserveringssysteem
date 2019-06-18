const { Schema, model } = require('mongoose');
const ObjectsSchema = new Schema({
    code: String,
    description: String,
    objectType: String,
    baseCost: Number,
    owner: String,
    lendOut: Boolean,
    lendOutSince: Date,
    blocked: Boolean,
    blockedSince: Date,
    blockedUntil: Date,
});

const objects = model('objects', ObjectsSchema);

module.exports = {
    schema: ObjectsSchema,
    model: objects
};