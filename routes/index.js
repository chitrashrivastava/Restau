var express = require('express');
var router = express.Router();
const User = require("../models/usermodel");
const passport = require("passport");
const nodemailer = require('nodemailer');
const LocalStrategy = require("passport-local");
const Seller=require('../models/sellermodel')
const bcrypt = require('bcrypt');
const session = require('express-session')
const Food=require('../models/uploadSellerProducts')
/* GET home page. */
router.get('/', function(req, res, next) {
    const user = req.session.userId;
    res.render('index', { user });
});

router.get('/register', function(req, res, next) {
  res.render('./auth/signup', { title: 'Express' });
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
      const user = await User.register(new User({ username, email }), password);
      res.send('User registered successfully <a href="/login">Login back </a>');
  } catch (err) {
      res.status(400).send(err.message);
  }
});

router.get('/login', function(req, res, next) {
  res.render('./auth/login', { title: 'Express' });
});

router.post("/login", async function(req, res, next) {
    const { email, password } = req.body;

    try {
        // Check if the user exists in the buyer model
        const buyer = await User.findOne({ email });
        if (buyer) {
            // Compare passwords
            const isPasswordValid = await bcrypt.compare(password, buyer.password);
            if (isPasswordValid) {
                // Store the buyer's ID in the session
                req.session.userId = buyer._id;
                // Redirect to buyer dashboard
                return res.redirect("/buyer-profile");
            }
        }

        // Check if the user exists in the seller model
        const seller = await Seller.findOne({ email });
        if (seller) {
            // Compare passwords
            const isPasswordValid = await bcrypt.compare(password, seller.password);
            if (isPasswordValid) {
                // Store the seller's ID in the session
                req.session.userId = seller._id;
                // Redirect to seller dashboard
                return res.redirect("/seller-profile");
            }
        }

        // If user does not exist or password is incorrect, redirect to login page
        return res.redirect("/login");
    } catch (error) {
        // Handle errors
        console.error("Login error:", error);
        return res.redirect("/login");
    }
});

router.get('/viewfood', function(req, res, next) {
  res.render('./food/viewfood', { title: 'Express' });
});

router.get('/forget', async (req, res) => {
  res.render('./auth/forgetpassword');
});

router.post('/forget', async (req, res) => {
  const { email } = req.body;
  try {
    await sendMail(email, res);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post("/send-mail", async function (req, res, next) {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.send("User not found");

        sendmailhandler(req, res, user);
    } catch (error) {
        console.log(error);
        res.send(error);
    }
});

function sendmailhandler(req, res, user) {
    const otp = Math.floor(1000 + Math.random() * 9000);
    // admin mail address, which is going to be the sender
    const transport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 465,
        auth: {
            user: "chitrashrivastava64@gmail.com",
            pass: "qihi lsfu hfwx teig",
        },
    });

    const mailOptions = {
        from: "Project Expense-Tracker <pranjalshukla245@gmail.com>",
        to: user.email,
        subject: "Action Required: Reset Your Expense Tracker Password",
        html:`<p class="otp">${otp}</p>`
        // text: req.body.message,
       
        
    };
    // actual object which intregrate all info and send mail
    transport.sendMail(mailOptions, async (err, info) => {
        if (err) {
           res.send(err)
        }

        console.log(info);
        user.resetPasswordOtp = otp;
        await user.save();
        res.render("otp", { admin: req.user, email: user.email, success: "Email sent successfully" });
    });
}
router.post("/match-otp/:email", async function (req, res, next) {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (user.resetPasswordOtp == req.body.otp) {
            user.resetPasswordOtp = -1;
            await user.save();
            res.render("resetpassword", { admin: req.user, id: user._id });
        } else {
            res.send(
                "Invalid OTP, Try Again <a href='/forget'>Forget Password</a>"
            );
        }
    } catch (error) {
        res.send(error);
    }
});
router.post('/resetpassword/:id', async function (req, res, next) {
    try {
        const user = await User.findById(req.params.id);

        
        // Use setPassword method provided by passport-local-mongoose
        user.setPassword(req.body.password, async function (err) {
            if (err) {
                throw err;
            }

            // Save the user to the database
            await user.save();

            // Log in the user
            req.login(user, function (err) {
                if (err) {
                    return next(err);
                }

                const escapedMessage = escapeScriptTag('Password successfully reset!');
                return res.send(`
                    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
                    <script>
                        document.addEventListener('DOMContentLoaded', function () {
                            Swal.fire({
                                icon: 'success',
                                title: 'Success!',
                                text: '${escapedMessage}',
                            }).then(() => {
                                window.location.href = '/login';
                            });
                        });
                    </script>
                `);
            });
        });
    } catch (error) {
        console.error(error);

        const escapedErrorMessage = escapeScriptTag(error.message || 'Error resetting password. Please try again.');
        return res.send(`
            <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
            <script>
                document.addEventListener('DOMContentLoaded', function () {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error!',
                        text: '${escapedErrorMessage}',
                    }).then(() => {
                        window.location.href = '/forget'; // Replace with your route
                    });
                });
            </script>
        `);
    }
});


router.get('/about', function(req, res, next) {
    const user = req.session.userId;
    res.render('about', { user});
  });

  
router.get('/menu', function(req, res, next) {
    res.render('menu', { });
  });
   
router.get('/contact', function(req, res, next) {
    const user = req.session.userId;

    res.render('contact', {user});
  });
  

// utils/security.js
function escapeScriptTag(input) {
    return input.replace(/<script\b[^<](?:(?!<\/script>)<[^<])*<\/script>/gi, '');
}

module.exports = {
    escapeScriptTag,
};

router.get('/seller-signup',(req,res,next)=>{
    const user=req.session.userId

    res.render('auth/signupseller',{user})
})

// Assuming you have a Seller model defined
router.post('/seller-signup', async (req, res, next) => {
    try {
        const { companyname, email, password, confirm_password } = req.body;

        // Check if passwords match
        if (password !== confirm_password) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Check if the email is already registered as a seller
        const existingSeller = await Seller.findOne({ email });
        if (existingSeller) {
            return res.status(400).json({ message: "Email already exists as a seller" });
        }

        // Check if the email is already registered as a buyer
        const existingBuyer = await User.findOne({ email });
        if (existingBuyer) {
            return res.status(400).json({ message: "Email already exists as a buyer" });
        }

        // Create a new seller instance
        const newSeller = new Seller({ companyname, email });

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Set the hashed password
        newSeller.password = hashedPassword;

        // Save the new seller to the database
        await newSeller.save();

        // Send a success response
        res.status(201).json({ message: "Seller registered successfully" });
    } catch (error) {
        // Handle any errors
        console.error("Error in seller signup:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.get('/buyer-signup',(req,res)=>{
    res.render("signupbuyer")
})
router.post('/buyer-signup', async (req, res, next) => {
    try {
        const { username, email, password, confirmpassword } = req.body;
        console.log(req.body)
        // Check if passwords match
        if (password !== confirmpassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Check if the email is already registered as a buyer
        const existingBuyer = await User.findOne({ email });
        if (existingBuyer) {
            return res.status(400).json({ message: "Email already exists as a buyer" });
        }

        // Check if the email is already registered as a seller
        const existingSeller = await Seller.findOne({ email });
        if (existingSeller) {
            return res.status(400).json({ message: "Email already exists as a seller" });
        }

        // Create a new buyer instance
        const newBuyer = new User({ username, email });

        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Set the hashed password
        newBuyer.password = hashedPassword;

        // Save the new buyer to the database
        await newBuyer.save();

        // Send a success response
        res.status(201).json({ message: "Buyer registered successfully" });
    } catch (error) {
        // Handle any errors
        console.error("Error in buyer signup:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
router.get('/update', async (req, res) => {
    try {
        // Check if the user is logged in
        const user=req.session.userId
        if (!req.session.userId) {
            return res.redirect('/login');
        }

        // Fetch the user based on the saved userId in the session
        const buyer = await User.findById(req.session.userId);

        if (!buyer) {
            // If user not found, redirect to login
            return res.redirect('/login');
        }

        // Render the updateProfile.ejs template with the buyer data
        res.render('updateProfile', { buyer,user });
    } catch (error) {
        console.error("Error fetching user for update:", error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/update', async (req, res) => {
    try {
        // Assuming you have the buyer's ID stored in the session, replace this with your logic
        const buyerId = req.session.userId;
        console.log(buyerId)
        // Fetch the existing buyer from the database
        const existingBuyer = await User.findById(buyerId);

        if (!existingBuyer) {
            return res.status(404).send('Buyer not found');
        }

        // Update the properties with the values from the form
        existingBuyer.username = req.body.username;
        existingBuyer.email = req.body.email;

        // Save the updated buyer to the database
        const updatedBuyer = await existingBuyer.save();

        // Redirect back to the buyer profile or another appropriate page
        res.redirect('/buyer-profile'); // Replace with the actual route

    } catch (error) {
        console.error("Error updating buyer profile:", error);
        res.status(500).send('Internal Server Error');
    }
});


router.get('/delete/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        // Find the user by ID and remove it from the database
        const deletedUser = await User.findByIdAndDelete(userId);

        if (deletedUser) {
            res.send(`User with ID ${userId} deleted successfully`);
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/logout', (req, res) => {
    // Assuming you're using session-based authentication
    req.session.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
        return res.status(500).json({ success: false, message: 'Failed to logout' });
      }
      res.clearCookie('sessionID'); // Clear session cookie
      res.json({ success: true, message: 'Logout successful' });
    });
  });

  router.get('/update/:id',async(req,res) =>{
    const userId = req.params.id;
    const user = await Seller.findById(userId);

    res.render('updateSeller',{user})

  })

  router.get('/explore-food', async (req, res) => {
    try {
        // Fetch products from the database
        const products = await Food.find();
const user=req.session.userId
        // Render the view and pass the products data
        res.render('explorebuyer', { products,user });
    } catch (error) {
        // Handle errors
        console.error("Error fetching products:", error);
        res.status(500).send("Internal server error");
    }
});


module.exports=router;

