const jwt = require("jsonwebtoken");

const jwtVerify = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  userId = decoded.userId;
  next();
};

module.exports = { jwtVerify };
