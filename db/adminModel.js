const mongoose = require("mongoose");

// Create a schema for the admins with the following fields:
const AdminSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: [true,"id is required"],
        unique: [true, "id already exists"], 
    },

    email: {
        type: String,
        required: [true, "Please provide an Email!"],
        unique: [true, "Email Exist"],
      },
    
      password: {
        type: String,
        required: [true, "Please provide a password!"],
        unique: false,
      },

    })

    module.exports = mongoose.model.Admins || mongoose.model("Admins", AdminSchema);