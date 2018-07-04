const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const flash = require('connect-flash-plus');
const session = require('express-session');
const bodyParser = require('body-parser');
const passport = require('passport');
const mongoose = require('mongoose');
//Initialize express
const app = express();

//Load Routes
const ideas = require('./routes/ideas');
const users = require('./routes/users');

//Database
const db = require('./config/database');

mongoose.connect(db.mongoURI)
    .then(() => { console.log("MongoDB connected.") })
    .catch(err => console.log(err));

//Passport Config
require('./config/passport')(passport);

app.set('view engine', 'ejs');

//Middleware for method override
app.use(methodOverride('_method'));

//Middleware for body-parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Static folder
app.use(express.static(path.join(__dirname, 'public')));

//Middleware for express session
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//Flash messages middleware
app.use(flash());

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

//Index Route
app.get('/', (req, res) => {
    const title = "Welcome!";
    res.render('index', {
        title: title
    });
});

//About Page
app.get('/about', (req, res) => {
    res.render('about');
});

//Use routes
app.use('/ideas', ideas);
app.use('/users', users);

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
