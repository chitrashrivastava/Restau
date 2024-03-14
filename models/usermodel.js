const mongoose = require('mongoose')
const plm = require("passport-local-mongoose");

const userModel = new mongoose.Schema(
    {
        
        username: String,
        password: String,
        confirmpassword:String,
        email: String,
        // default isliye kyuki jbb bhi koi user register krega to accountType Buyer save hoga jisse apn user ko track krr ske jbb wo login ho ki wo buyer h ya seller
        resetPasswordOtp: {
            type: Number,
            default:-1,
    },
    accountType:{
        type:String,
        default:"Buyer"
    },
    },
    { timestamps: true }
);

userModel.plugin(plm);

module.exports = mongoose.model("buyer", userModel);


// schema ko database me save krana h