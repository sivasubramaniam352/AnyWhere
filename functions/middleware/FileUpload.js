const { admin } = require("../services/utils");
const config = require("../config/config");

module.exports = (req, res,next) => {
    const BusBoy = require("busboy");
    const path = require("path");
    const os = require("os");
    const fs = require("fs");
    const { v4: uuidv4 } = require("uuid");
  
    const busboy = new BusBoy({ headers: req.headers });
  
    let imageFileName, imageFilePath, imageMetaData;
    let  imageType;
    const imageId = uuidv4();
  
    busboy.on("file", (fieldname, file, filename, encoding, mimetype) => {
      const imageExtension = filename.split(".")[filename.split(".").length - 1];
      imageType = filename.split(".")[filename.split(".").length - 1];
  
      imageFileName = `${Math.round(
        Math.random() * 100000000000
      )}.${imageExtension}`;
  
      const filepath = path.join(os.tmpdir(), imageFileName);
  
      imageFilePath = filepath;
      imageMetaData = mimetype;
  
      file.pipe(fs.createWriteStream(imageFilePath));
    });
  
    busboy.on("finish", () => {
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
          req.uploadfileLink = profileImg
          req.uploadFileType = imageType
          next();  
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).json({ error: err.code });
        });
    });
  
    busboy.end(req.rawBody);

};