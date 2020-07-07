var cors = require('cors')
var mongodb = require('mongodb')
var ObjectID = mongodb.ObjectID
const express = require('express')
const app = express()
app.use(cors())
const port = 3000
var bodyParser = require('body-parser')
const {response} = require('express')
const {request} = require('http')
var jwt = require('jsonwebtoken')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

// create MongoBD client
var MongoClient = mongodb.MongoClient
// connect url DB
var url = 'mongodb://localhost:27017'
var connect_db;
MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, function (err, client) {
    if (err) {
        console.log('Unable to connect to MongoDB', err)
    } else {
        connect_db = client.db('logindb');
    }
})

// Register router
app.post('/register', function (req, res) {
    var post_data = req.body

    res.send(post_data)

    var email = post_data.email
    var password = post_data.password

    var insertJson = {
        'email': email,
        'password': password
    }

    connect_db.collection('users').find({'email': email}).toArray((error, result) => {
        if (error) {
            res.send("Error")
        } else {
            connect_db.collection('users').insertOne(insertJson, function (err, result) { // res.send('Reg success')
                console.log('Reg success')
            })
        }
    })
})

// router login
app.post('/login', (req, res) => {
    var post_data = req.body

    var email = post_data.email
    var password = post_data.password

    connect_db.collection('users').find({'email': email}).count(function (err, number) {
        if (number === 0) {
            res.json('Email not exists')
            console.log('Email not exists')
        } else { // authentication
            connect_db.collection('users').findOne({
                'email': email
            }, function (err, users) {
                if (users.email == email && users.password == password) { // res.json({"success":1,"email":email,"password":password})
                    var token = jwt.sign({
                        Name: 'testName'
                    }, '7777', {
                        algorithm: 'HS256',
                        expiresIn: '3m'
                    })
                    res.json({access_token: token, 'statusLogin': 'OK'})
                    console.log('login success.')
                } else {
                    res.json({"success": 0, "email": email, "password": password})
                    console.log('Wrong password')
                }
            })
        }
    })
})

// Middleware
app.use((req, res, next) => { // console.log('%O', req);
    next();
});

// root router
app.get('/', (req, res) => {
    res.send('Hello World!')
    console.log('======Have a The Get Request')
    //     console.log(req.body)
    //     res.send({'abc':'Hello World!'})
})

app.listen(port, () => console.log('Example app listening at http://localhost:${port}'))