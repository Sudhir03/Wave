const express = require("express");
const { requireAuth } = require("../middlewares/requireAuth");
const blockController = require("../controllers/blockController");

const router = express.Router();

router.post("/:userId", requireAuth, blockController.blockUser);
router.delete("/:userId", requireAuth, blockController.unblockUser);
router.get("/", requireAuth, blockController.getBlockedUsers);

module.exports = router;
