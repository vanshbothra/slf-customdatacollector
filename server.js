const express = require("express");
const app = express();
const session = require('express-session');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const moment = require("moment");
const passport = require("passport");
require('dotenv').config();

require("./auth");

function isLoggedIn(req, res, next) {
    req.user ? next() : res.sendStatus(401);
}

app.use(session({ secret: 'cats', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.set("view engine", "ejs");

app.use((req, res, next)=>{
    res.locals.moment = moment;
    next();
});

MONGO_USER = process.env.MONGO_USER;
MONGO_PWD = process.env.MONGO_PWD;

mongoose.connect("mongodb+srv://"+MONGO_USER+":"+MONGO_PWD+"@test.7sz5dc4.mongodb.net/kota-crashdata")

const dataSchema = {
    crashDate: Date,
    FIRNumber: Number,
    crashDistrict: String,
    crashJurisdiction: String,
    crashBetween: String,
    numberofFatalities: Number,
    FIRSummary: String
}

const Data = mongoose.model("Data", dataSchema);

app.use(bodyParser.urlencoded({extended: false}));

app.get('/', (req, res) => {
    res.send('<a href="/auth/google">Authenticate with Google</a>');
});

app.get('/auth/google',
    passport.authenticate('google', { scope: [ 'email', 'profile' ], hostedDomain: 'ashoka.edu.in' }
));

app.get( '/auth/google/callback',
  passport.authenticate( 'google', {
    successRedirect: '/submit-data',
    failureRedirect: '/auth/google/failure'
  })
);

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });
  
app.get('/auth/google/failure', (req, res) => {
    res.send('Failed to authenticate..');
});

app.get("/submit-data", isLoggedIn, function(req, res) {
    res.sendFile(__dirname + "/index.html");
})

app.post("/submit-data", isLoggedIn, function(req, res) {
    let pushData = new Data ({
        crashDate: req.body.crashDate,
        FIRNumber: req.body.FIRNumber,
        crashDistrict: req.body.crashDistrict,
        crashJurisdiction: req.body.crashJurisdiction,
        crashBetween: req.body.crashBetween,
        numberofFatalities: req.body.numberofFatalities,
        FIRSummary: req.body.FIRSummary
    });
    pushData.save();
    res.redirect("/submit-data");
})

app.get("/viewdata", isLoggedIn, (req, res) => {
    Data.find().then(function(viewdata) {
        res.render("viewdata", {
            displaydata: viewdata
        })
    })    
})

app.listen(3030, function(){
    console.log("server running on port 3030")
})