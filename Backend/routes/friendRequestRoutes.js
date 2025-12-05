const express = require("express");

const friendController = require("../controllers/friendRequestController");

const { requireAuth } = require("../middlewares/requireAuth");

const router = express.Router();

router.post("/send", requireAuth, friendController.sendFriendRequest);

router.get("/", requireAuth, friendController.getPendingRequests);

router.post("/:id/accept", requireAuth, friendController.acceptFriendRequest);

router.post("/:id/decline", requireAuth, friendController.declineFriendRequest);

module.exports = router;
