const { db } = require("../services/utils");

exports.post = (req, res) => {

  let media = { fileUrl: req.uploadfileLink, fileType: req.uploadFileType };

  let newPost = {
    ...req.body,
    poster: req.user.regno,
    url: media.fileUrl,
    urlType: media.fileType === "png" || media.fileType === "jpg" ? "image" : "video",
    posterImage: req.user.profileImg,
    posterName: req.user.profileName,
    createdAt: new Date().toISOString(),
  };

  db.collection("posts")
    .add(newPost)
    .then((docs) => {
      res.json({ message: `Posts ${docs.id} created successfully` });
    })
    .catch((err) => {
      return res.json({ error: err });
    });
};

exports.getALL = async (req, res) => {
  let posts = [];
  let modifiyPosts = [];
  let post = await db.collection("posts").get();

  post.forEach((doc) => {
    posts.push(doc.data());
  });



  if (posts.length > 0) {
    posts.forEach(async(doc) =>{
      let user = await db.collection("users").where('regno','==',doc.regno).get()
      let userData = await user.docs[0].data();
      let newData = {...doc,profileImage:userData.profileImage,posterName:userData.profileName};
      modifiyPosts.push(newData);

    })
    return res.json({ Posts: modifiyPosts });
  } else {
    return res.json({ error: "invalid process" });
  }
};
