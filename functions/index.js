const functions = require('firebase-functions');
const needsAuth = require('./middleware/Auth');
const UserController = require('./controllers/UserController');
const PostController = require('./controllers/PostController');



const app = require('express')();

app.post('/signup',UserController.create);

app.post('/login',UserController.login);

app.post('/post',needsAuth,PostController.post)


//https://baseurl.com/api/

exports.api = functions.https.onRequest(app);