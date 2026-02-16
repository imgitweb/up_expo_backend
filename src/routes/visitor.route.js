const express = require("express");
const { registerVisitor,downloadVisitorPass } = require("../controllers/visitor.controller");

const router = express.Router();

router.post("/register", registerVisitor);
router.get("/download/:id", downloadVisitorPass);

module.exports = router;
