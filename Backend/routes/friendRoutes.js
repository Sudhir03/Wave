const express = require("express");

const { requireAuth } = require("../middlewares/requireAuth");

const friendController = require("../controllers//friendController");

const router = express.Router();

router.get("/my", requireAuth, friendController.getMyFriends);

router.post("/:id/remove-friend", requireAuth, friendController.removeFriend);

module.exports = router;
