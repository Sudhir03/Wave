const express = require("express");

const { requireAuth } = require("../middlewares/requireAuth");
const callController = require("../controllers/callController");

const router = express.Router();

router.get("/history", requireAuth, callController.getMyCallHistory);

module.exports = router;
