const express = require("express");
const conversationPreferenceController = require("../controllers/conversationPreferenceController");
const { requireAuth } = require("../middlewares/requireAuth");

const router = express.Router();

router.get("/", requireAuth, conversationPreferenceController.getMyPreferences);

router.get(
  "/:conversationId",
  requireAuth,
  conversationPreferenceController.getPreference
);

router.patch(
  "/:conversationId",
  requireAuth,
  conversationPreferenceController.updatePreference
);

module.exports = router;
