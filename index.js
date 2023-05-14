const express = require('express')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const db = require('./db')
const User = require('./models/modelUser')

const verify = (username, password, done) => {
    db.users.findByUsername(username, (err, user) => {
        if (err) {
            return done(err)
        }
        if (!user) {
            return done(null, false)
        }
        if (!db.users.verifyPassword(user, password)) {
            return done(null, false)
        }
        return done(null, user)
    })
}

const options = {
    usernameField: "username",
    passwordField: "password",
}

passport.use('local', new LocalStrategy(options, verify))

passport.serializeUser((user, cb) => {
    cb(null, user.id)
})

passport.deserializeUser((id, cb) => {
    db.users.findById(id, (err, user) => {
        if (err) {
            return cb(err)
        }
        cb(null, user)
    })
})

const app = express()
app.set('view engine', 'ejs')

app.use(express.urlencoded({extended: false}))
app.use(session({secret: 'SECRET', resave: true, saveUninitialized: true}))

app.use(passport.initialize())
app.use(passport.session())

app.get('/api/user/login', (req, res) => {
    res.render('login')
})

app.post('/api/user/login',
    passport.authenticate('local', {failureRedirect: '/api/user/login'}),
    (req, res) => {
        res.redirect('/api/user/me')
    })

app.get('/api/user/logout', (req, res) => {
    req.logout(() => {
    })
    res.redirect('/api/user/login')
})

app.get('/api/user/me',
    (req, res, next) => {
        if (!req.isAuthenticated()) {
            return res.redirect('/api/user/login')
        }
        next()
    },
    (req, res) => {
        res.render('profile', {user: req.user})
    }
)

app.get('/api/user/signup', (req, res) => {
    res.render('reg')
})

app.post('/api/user/signup', async (req, res) => {
    try {
        const {username, password} = req.body
        const candidate = await User.findOne({username})
        if (candidate) {
            res.json({msg: 'Пользователь с таким именем существует'})
        }
        const newUser = new User({username: username, password: password})
        await newUser.save()
        res.redirect('/api/user/login')
    } catch (e) {
        console.log(e)
        res.status(400).json(e)

    }
})

mongoose.set('strictQuery', false)

async function start(port, dbUrl) {
    try {
        await mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
            console.log('Mongoose connect')
        })
        app.listen(PORT, (err) => {
            if (err) console.log(err)
            console.log(`server listening on port ${PORT} ...`)
        })

    } catch (e) {
        console.log(e)
    }

}

const PORT = process.env.PORT || 3000
const URLDB = "mongodb://localhost:27017/users"
start(PORT, URLDB)
