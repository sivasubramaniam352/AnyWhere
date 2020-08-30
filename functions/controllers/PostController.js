const { db } = require("../services/utils");

exports.post = (req, res) => {
  let newPost = {
    poster: req.user.regno,
    postTitle: req.body.postTitle,
    createdAt: new Date().toISOString(),
  };

  db.collection("posts")
    .add(newPost)
    .then((docs) => {
      res.json({ message: `Posts ${docs.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: "something wet  wrong" });
      console.error(err);
    });
};
