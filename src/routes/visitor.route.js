const express = require("express");
const { registerVisitor } = require("../controllers/visitor.controller");

const router = express.Router();

router.post("/register", registerVisitor);

module.exports = router;
