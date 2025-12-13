const express = require("express");

const { requireAuth } = require("../middlewares/requireAuth");

const friendController = require("../controllers//friendController");

const router = express.Router();

router.post("/send", requireAuth, friendController.sendFriendRequest);

router.get("/", requireAuth, friendController.getPendingRequests);

router.get("/sent", requireAuth, friendController.getSentRequests);

router.post("/:id/cancel", requireAuth, friendController.cancelFriendRequest);

router.post("/:id/accept", requireAuth, friendController.acceptFriendRequest);

router.post("/:id/decline", requireAuth, friendController.declineFriendRequest);

router.get("/my", requireAuth, friendController.getMyFriends);

router.post("/:id/remove-friend", requireAuth, friendController.removeFriend);

module.exports = router;
