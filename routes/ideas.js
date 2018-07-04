const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const isAnImageUrl = require('is-an-image-url');
const { ensureAuthenticated } = require('../helpers/auth');

let errors = [];

//Load Idea model
require("../models/Ideas");
const Idea = mongoose.model('ideas');

//Ideas Main Page
router.get('/', ensureAuthenticated, (req, res) => {
    Idea.find({ user: req.user.id })
        .sort({ date: 'desc' })
        .then(ideas => {
            res.render('ideas/index', {
                ideas: ideas
            });
        });
});

//Add Idea Page
router.get('/add', ensureAuthenticated, (req, res) => {
    if(req.body.title)
        res.render('ideas/add', { errors: errors });
    else {
        res.render('ideas/add', { errors: "" });
    }
});

//Handle form submit
router.post('/', ensureAuthenticated, (req, res) => {
    errors.length = 0;
    errorHandle(req);

    if (errors.length > 0) {
        res.render("ideas/add", {
            errors: errors,
            title: req.body.title,
            description: req.body.description,
            image: req.body.image
        });
    }
    else {
        errors.length = 0;
        const newEntry = {
            title: req.body.title,
            description: req.body.description,
            image: req.body.image,
            user: req.user.id
        }
        new Idea(newEntry)
            .save()
            .then(idea => {
                req.flash("success_msg", "New entry has been added successfully");
                res.redirect('/ideas');
            }
        );
    }
});

//Edit Idea Page
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
    Idea.findOne({
        _id: req.params.id
    }).then(idea => {
        if (idea.user != req.user.id) {
            req.flash('error_msg', 'Not authorized!');
            res.redirect('/ideas');
        } else {
            res.render('ideas/edit', {
                errors: "",
                idea: idea
            });
        }
    });
});

//Handle Edit Submit
router.put('/:id', ensureAuthenticated, (req, res) => {
    errors.length = 0;
    errorHandle(req);
    if (errors.length > 0) {
        Idea.findOne({
            _id: req.params.id
        }).then(idea => {
            if (idea.user != req.user.id) {
                req.flash('error_msg', 'Not authorized!');
                res.redirect('/ideas');
            } else {
                res.render('ideas/edit', {
                    errors: errors,
                    idea: idea
                });
            }
        });
    }
    else {
        Idea.findByIdAndUpdate(req.params.id,
            {
                title: req.body.title,
                description: req.body.description,
                image: req.body.image
            }, (err, idea) => {
                if (err) {
                    console.log("Error");
                }
                else {
                    req.flash('success_msg', 'Entry has been updated successfully');
                    res.redirect("/ideas");
                }
            }
        );
    }
});

//Delete Idea
router.delete('/:id', ensureAuthenticated, (req, res) => {
    Idea.remove({
        _id: req.params.id
    }).then(() => {
        req.flash('success_msg', 'Entry has been removed successfully.')
        res.redirect('/ideas');
    });
});

//Error Handling
function errorHandle(req) {
    if (!req.body.title) {
        errors.push({ text: "Please enter a title." });
    }

    if (!req.body.description) {
        errors.push({ text: "Please enter a description." });
    }

    isAnImageUrl(req.body.image, function (isAnImageResult) {
        if (!isAnImageResult) {
            errors.push({ text: "Please enter a valid image url." });
        }
    });
};

module.exports = router;
