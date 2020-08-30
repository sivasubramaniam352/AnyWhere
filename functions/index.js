const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

const express = require('express');
const app = express();


app.get('/users', (req,res) => {
    admin.firestore().collection('users').orderBy('createdAt','desc').get()
    .then(docs =>{
        let users = [];
        docs.forEach(doc =>{
            users.push(doc.data());
        });
        return res.json(users);
    })
    .catch(err => console.error(err))
})

app.post('/create',(req,res) => {

    let newUser = {
        regno: req.body.regno,
        name:req.body.name,
        createdAt:new Date().toISOString()
    }

    admin.firestore().collection('users').add(newUser)
        .then(docs => {
            res.json({message: `User ${docs.id} created successfully`});
        })
        .catch(err =>{
            res.status(500).json({error:'something wet  wrong'});
            console.error(err);
        })

})

//https://baseurl.com/api/

exports.api = functions.https.onRequest(app);