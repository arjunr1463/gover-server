const jwt = require("jsonwebtoken");

const jwtVerify = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null)
    return res.status(401).json({
      status: false,
      message: "please provide a token",
    });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    userId = decoded.userId;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      status: false,
      message: "something went wrong",
    });
  }
};

module.exports = { jwtVerify };
