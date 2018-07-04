const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();

let errors = [];

require("../models/Users");
const User = mongoose.model('users');

let user = {
    name: "",
    email: "",
    password: "",
    password2: ""
}

//User Login
router.get('/login', (req, res) => {
    res.render('users/login');
});

//User Register
router.get('/register', (req, res) => {
    errors.length = 0;
    res.render('users/register', {
        errors: errors,
        name: "",
        email: "",
        password: "",
        password2: ""
    });
});

//Login Form Post
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/ideas',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

//Handle Register submit
router.post('/register', (req, res) => {
    errors.length = 0;
    user.name = req.body.name;
    user.email = req.body.email;
    user.password = req.body.password;
    user.password2 = req.body.password2;

    if (req.body.password.length < 6) {
        errors.push({ text: "Password should at-least be 6 characters long" });
        if (req.body.password != req.body.password2) {
            errors.push({ text: "Passwords do not match" });
        }
    }

    if (errors.length > 0) {
        res.render("users/register", {
            errors: errors,
            name: user.name,
            email: user.email,
            password: user.password,
            password2: user.password2
        });
    } else {
        User.findOne({email: req.body.email})
        .then(user => {
            if(user) {
                req.flash('error_msg', 'Email already registered!');
                res.redirect('/users/register');
            }
            else{
                const newUser = {
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    password2: req.body.password2
                }
                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err){
                            console.log(err);
                        }
                        newUser.password = hash;
                        new User(newUser)
                        .save()
                        .then(user => {
                            req.flash('success_msg', 'Registration successful!');
                            res.redirect("/users/login");
                        })
                        .catch(err => {
                            console.log(err);
                        });
                    });
                });
            }
        });
    }

});

//Logout
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', "Logout was successful!");
    res.redirect("/users/login");
});

module.exports = router;

