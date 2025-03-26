const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'superadmin'
    },
});

module.exports = mongoose.model('Admin', AdminSchema);
console.log('Admin Schema created successfully');