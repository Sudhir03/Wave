const express = require("express");

const { requireAuth } = require("../middlewares/requireAuth");

const conversationController = require("../controllers/conversationController");

const router = express.Router();

router.get("/:friendId", requireAuth, conversationController.getConversationId);

router.post(
  "/:friendId",
  requireAuth,
  conversationController.createConversation
);

module.exports = router;
