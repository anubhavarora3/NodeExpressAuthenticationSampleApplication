const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

var config = require('./../config');
var {User} = require('./../models/user');

var app = express();
var apiRoutes = express.Router();

var port = process.env.PORT || 8080;

mongoose.connect(config.database);
mongoose.Promise = global.Promise;
app.set('superSecret', config.secret);

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/', (req, res) => {
    res.send(`Hola. The API is at http://localhost:${port}/api`);
});

app.get('/setup', (req, res) => {
    var newUser = new User({
        name: 'Anubhav Arora',
        password: 'pass123',
        admin: true
    });

    newUser.save().then(() => {
        console.log('User Saved Successfully !');
        res.json({
            success: true
        });
    }).catch((err) => {
        console.log(err);
    });
});

//authentication Route

apiRoutes.post('/authenticate', (req, res) => {
    User.findOne({
        name: req.body.name
    }).then((user, err) => {
        if (!user) {
            res.json({
                success: false,
                message: 'Authentication failed, User not found!'
            });
        } else if (user) {
            if (user.password != req.body.password) {
                res.json({
                    success: false,
                    message: 'Authentication failed, Incorrect Password!'
                });
            } else {
                var token = jwt.sign(user, app.get('superSecret'), {
                    expiresIn: 1440
                });
                res.header('x-auth', token).json({
                    success: true,
                    message: 'Token Obtained.'
                });
            }
        }
    }).catch((err) => {
        res.json({error: err});
    });
});

apiRoutes.use((req, res, next) => {
    var token = req.header('x-auth');

    if (token) {
        try {
            jwt.verify(token, app.get('superSecret'));
            next();
        } catch(e) {
            return res.json({
                success: false,
                message: 'Failed to authenticate token'
            });
        }

    } else {
        return res.status(403).send({
            success: false,
            message: 'No Token Provided!'
        });
    }
});

apiRoutes.get('/', (req, res) => {
    res.json({message: 'Welcome to the API'});
});

apiRoutes.get('/users', (req, res) => {
    User.find().then((users) => {
        res.json(users);
    });
});


app.use('/api', apiRoutes);

app.listen(port, () => {
    console.log(`Connected to server at port ${port}`);
});
