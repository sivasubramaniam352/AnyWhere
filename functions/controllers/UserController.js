const { db, admin } = require("../services/utils");
const config = require("../config/config");
const firebase = require("firebase");
const User = require('../models/User');

firebase.initializeApp(config);

exports.create = (req, res) => {
  let token, userId;

  // TODO: validate data

  const defaultProfileImg =
    "https://firebasestorage.googleapis.com/v0/b/anywhere-5cd4f.appspot.com/o/noImage.png?alt=media";

  db.doc(`/users/${req.body.regno}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ regNo: "this regno is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(req.body.email, req.body.password);
      }
    })
    .then((data) => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((isToken) => {
      token = isToken;
      let userData = {
        ...req.body,
        profileImg: defaultProfileImg,
        profileName: req.body.name,
        createdAt: new Date().toISOString(),
        userId,
      };
      delete userData.password;
      return db.doc(`/users/${req.body.regno}`).set(userData);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password,
  };

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
      return data.user.getIdToken();
    })
    .then((token) => {
      let BearerToken = `Bearer ${token}`;
      return res.status(201).json({ token: BearerToken });
    })
    .catch((err) => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

exports.uploadImage = (req, res) => {
  const BusBoy = require("busboy");
  const path = require("path");
  const os = require("os");
  const fs = require("fs");
  const { v4: uuidv4 } = require("uuid");

  console.log(req.body, "bodyImage");

  const busboy = new BusBoy({ headers: req.headers });

  let imageFileName, imageFilePath, imageMetaData;
  const imageId = uuidv4();

  busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
    const imageExtension = filename.split(".")[filename.split(".").length - 1];

    imageFileName = `${Math.round(
      Math.random() * 100000000000
    )}.${imageExtension}`;

    const filepath = path.join(os.tmpdir(), imageFileName);

    imageFilePath = filepath;
    imageMetaData = mimetype;

    file.pipe(fs.createWriteStream(imageFilePath));
  });

  busboy.on("finish", () => {
    console.log(imageFilePath, "ImagFilePath!", imageMetaData, "ImagMeta!");
    admin
      .storage()
      .bucket()
      .upload(imageFilePath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageMetaData,
            firebaseStorageDownloadTokens: imageId,
          },
        },
      })
      .then(() => {
        const profileImg = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media&token=${imageId}`;
        return db.doc(`/users/${req.user.regno}`).update({ profileImg });
      })
      .then(() => {
        return res.json({ message: "image uploaded successfully" });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: err.code });
      });
  });

  busboy.end(req.rawBody);
};

exports.getUsers = (req, res) => {
  db.collection("users")
    .orderBy("createdAt", "desc")
    .get()
    .then((docs) => {
      let users = [];
      docs.forEach((doc) => {
        users.push(doc.data());
      });
      return res.json(users);
    })
    .catch((err) => console.error(err));
};

exports.getUser = (req, res) => {
  let user = req.user;
  db.collection("users")
    .where("regno", "==", user.regno)
    .limit(1)
    .get()
    .then((docs) => {
      let data = docs.docs[0].data();
      if (!data) return res.json({ message: "user doesnot exisits" });
      if (data)
        return res.status(200).json({ message: "User data", user: data });
    })
    .catch((err) => {
      console.error(err);
      return res.json({ error: err.code });
    });
};
