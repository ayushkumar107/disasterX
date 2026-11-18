"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = require("express");
var _chatController = require("../controllers/chatController");

const router = (0, _express.Router)();

router.get('/rooms', _chatController.getRooms);
router.get('/rooms/:roomId/messages', _chatController.getMessages);
router.post('/rooms/:roomId/messages', _chatController.sendMessage);

var _default = exports.default = router;
