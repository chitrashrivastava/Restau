const mongoose = require('mongoose')
const plm = require("passport-local-mongoose");


const sellerModel = new mongoose.Schema(
    {
        companyname: String,
        password:String,
        email:String,
        confirmpassword:String,
         // default isliye kyuki jbb bhi koi user register krega to accountType seller save hoga jisse apn user ko track krr ske jbb wo login ho ki wo seller h ya buyer
        accountType:{
            type:String,
            default:"Seller"
        }
    }
)

sellerModel.plugin(plm);
module.exports = mongoose.model("seller",sellerModel)
