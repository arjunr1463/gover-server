const express = require("express");
require("dotenv").config();
require("./connection/db_connection");
const router = require("./router/routers");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const server = express();
server.use(cors());
server.use(cookieParser());
server.use(express.json());
server.use(router);
const post = 5000;
server.listen(post, () => {
  console.log(`server is running ${post} in this port`);
});
