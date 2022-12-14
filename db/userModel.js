const mongoose = require("mongoose");

// Create a schema for the user with the following fields:
const UserSchema = new mongoose.Schema({
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
      active: {
        type: Boolean,
        required: [false, "Please provide a status!"],
        unique: false,
      }
    })

    module.exports = mongoose.model.Users || mongoose.model("Users", UserSchema);