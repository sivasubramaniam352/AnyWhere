const functions = require("firebase-functions");
const needsAuth = require("./middleware/Auth");
const UserController = require("./controllers/UserController");
const PostController = require("./controllers/PostController");
const FileUpload = require("./middleware/FileUpload");


const app = require("express")();

app.post("/signup", UserController.create);

app.post("/login", UserController.login);

app.get("/users", UserController.getUsers);

app.get("/getUser", needsAuth, UserController.getUser);

app.post("/uploadImage", needsAuth, UserController.uploadImage);

app.post("/post", needsAuth, FileUpload ,PostController.post);

app.get("/post/getAll", needsAuth, PostController.getALL);

//https://baseurl.com/api/

exports.api = functions.https.onRequest(app);
