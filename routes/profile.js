var express = require('express');
var router = express.Router();
const User = require("../models/usermodel");
const passport = require("passport");
const nodemailer = require('nodemailer');
const LocalStrategy = require("passport-local");
const Seller=require('../models/sellermodel')
const bcrypt = require('bcrypt');
router.get('/buyer-profile', async (req, res) => {
    try {
        // Check if the user is authenticated (i.e., if userId is stored in the session)
        if (!req.session.userId) {
            // If the user is not authenticated, redirect to the login page
            return res.redirect("/login");
        }

        // Fetch the buyer details using the stored userId
        const buyer = await User.findById(req.session.userId);

        // Render the buyer profile page with the buyer details
        res.render('buyerprofile', { buyer, id: req.session.userId, user: buyer });
    } catch (error) {
        // Handle errors
        console.error("Error fetching buyer details:", error);
        res.status(500).send("Internal server error");
    }
});
router.get('/seller-profile', async (req, res) => {
    try {
        // Check if the user is authenticated (i.e., if userId is stored in the session)
        if (!req.session.userId) {
            // If user is not authenticated, redirect to login page
            return res.redirect("/login");
        }

        console.log(req.session.userId)
        // Fetch the buyer details using the stored userId
        const seller = await Seller.findById(req.session.userId);
        const id=req.session.userId
        console.log(req.session.userId)
        // Render the buyer profile page with the buyer details
        res.render('sellerprofile', { seller,user:seller,id:req.session.userId });
    } catch (error) {
        // Handle errors
        console.error("Error fetching buyer details:", error);
        res.status(500).send("Internal server error");
    }
});
router.post('/update/:id', async (req, res) => {
    try {
        const sellerId = req.params.id;
        const { companyname, email } = req.body;

        // Update the seller's profile in the database
        const updatedSeller = await Seller.findByIdAndUpdate(sellerId, { companyname, email }, { new: true });

        if (!updatedSeller) {
            // If the seller is not found, return an error response
            return res.status(404).send("Seller not found");
        }

        // Redirect to the seller profile page with a success message
        res.redirect(`/update/${sellerId}`);
    } catch (error) {
        // Handle errors
        console.error("Error updating seller profile:", error);
        res.status(500).send("Internal server error");
    }
});

module.exports=router