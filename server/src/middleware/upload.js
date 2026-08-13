"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.upload = void 0;
var _multer = _interopRequireDefault(require("multer"));
var _path = _interopRequireDefault(require("path"));
var _crypto = _interopRequireDefault(require("crypto"));
var _env = require("../config/env");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const storage = _multer.default.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, _env.env.UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = _path.default.extname(file.originalname);
    cb(null, `${_crypto.default.randomUUID()}${ext}`);
  }
});
const fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`));
  }
};
const upload = exports.upload = (0, _multer.default)({
  storage,
  fileFilter,
  limits: {
    fileSize: _env.env.MAX_FILE_SIZE,
    files: 5
  }
});