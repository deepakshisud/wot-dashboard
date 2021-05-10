const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const fetch = require('node-fetch');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const methodOverride = require('method-override');
const User = require('./models/user');
const Data = require('./models/data');

mongoose.connect('mongodb://localhost:27017/wot-dashboard', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

app.set('view engine', 'ejs');
app.set('views',path.join(__dirname, '/views'));
app.engine('ejs',ejsMate);
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const sessionConfig = {
    secret: 'asecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000*60*60*24*7,
        maxAge: 1000*60*60*24*7
    }
}
app.use(session(sessionConfig));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
     res.locals.currentUser = req.user;
     next();
 })


app.get('/', (req, res) => {
    res.render('home');
}) 

app.get('/about', (req, res) => {
    res.render('about');
})

app.post('/getdata', async(req, res)=> {
    await fetch('https://api.thingspeak.com/channels/1381505/feeds.json?api_key=0WZ9O9SQ1147GTEQ&results=50')
            .then(res => res.json())
            .then(json => {
                for(let feed of json.feeds) {
                    const pt = parseFloat(feed.field1) || 0;
                    const dist = parseFloat(feed.field2) || 0;
                    const gar = parseFloat(feed.field3) || 0;
                    const ele = parseFloat(feed.field4) || 0;
                    const co = parseFloat(feed.field5) || 0;
                    const te = parseFloat(feed.field6) || 0;
                    const d = new Date(feed.created_at);
                    const date = d.getTime();
                    const data = new Data();
                    data.persontemp.val = pt;
                    data.persontemp.timestamp = date;
                    data.distance.val = dist;
                    data.distance.timestamp = date;
                    data.garbagelevel.val = gar;
                    data.garbagelevel.timestamp = date;
                    data.elevator.val = ele;
                    data.elevator.timestamp = date;
                    data.colevel.val = co;
                    data.colevel.timestamp = date;
                    data.temp.val = te;
                    data.temp.timestamp = date;
                    data.save();
                }
            })
    res.redirect('/dashboard');
})

app.get('/dashboard', async(req, res) => {
    if(!req.isAuthenticated()) {
        res.redirect('/login');
    } else {
        const data = await Data.find({});
        res.render('dashboard', {data});
    }
})

app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', passport.authenticate('local', {failureRedirect: '/login'}), (req, res) => {
    res.redirect('dashboard');
})

app.get('/register', (req, res) => {
    res.render('register');
})

app.post('/register', async(req, res) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registeredUser = await User.register(user, password);
        res.redirect('dashboard');
    } catch(e) {
        res.redirect('register');
    }
})

app.get('/logout', (req, res) => {
    res.render('home');
})

app.listen(3000, () => {
    console.log("connected on port 3000");
})