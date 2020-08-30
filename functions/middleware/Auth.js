const { admin, db } = require("../services/utils");

module.exports = (req, res, next) => {
  let isToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    isToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    return res.status(403).json({ error: "Unauthorized!" });
  }

  admin
    .auth()
    .verifyIdToken(isToken)
    .then((decode) => {
      req.user = decode;
      return db
        .collection("users")
        .where("userId", "==", req.user.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      req.user.regno = data.docs[0].data().regno;
      return next();
    })
    .catch((err) => {
      console.error(err);
      return res.status(404).json({ error: "Unhandled process of Auth token" });
    });
};
