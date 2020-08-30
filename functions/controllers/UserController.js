const { db } = require("../services/utils");
const config = require('../config/config');
const firebase = require('firebase');

firebase.initializeApp(config);

exports.create = (req,res) => {

    let token, userId;

    const newUser = {
        email: req.body.email,
        password: req.body.password,
        regno:req.body.regno,
        name:req.body.name
    };

    // TODO: validate data

    db.doc(`/users/${newUser.regno}`).get()
        .then(doc => {
            if(doc.exists){
                return res.status(400).json({regNo: 'this regno is already taken'})
            }
            else {
                return firebase.auth().createUserWithEmailAndPassword(newUser.email,newUser.password);            
            }
        }).then(data => {
            userId = data.user.uid;
            return data.user.getIdToken();
        }).then(isToken =>{

            token = isToken;
            let userData = {
                email : newUser.email,
                regno:newUser.regno,
                name:newUser.name,
                createdAt: new Date().toISOString()
            }
            return db.doc(`/users/${newUser.regno}`).set(userData);
        })
        .then(() => {
            return res.status(201).json({token});
        })
        .catch(err =>{
            console.error(err);
            return res.status(500).json({error: err.code});
        });
}

exports.login = (req,res) => {

    const user = {
        email:req.body.email,
        password:req.body.password
    }

    firebase.auth().signInWithEmailAndPassword(user.email,user.password)
    .then(data => {
        return data.user.getIdToken();
    }).then(token =>{
        let BearerToken = `Bearer ${token}`;
        return res.status(201).json({token : BearerToken})
    })
    .catch(err => {
        console.error(err);
        return res.status(500).json({error:err.code})
    })
}