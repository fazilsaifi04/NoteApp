const express = require("express");
const router = express.Router();
const { getNotes, createNote, deleteNote, updateNote} = require("../controller/noteController");
const { auth } = require("../middlewares/auth");

router.get("/", auth, getNotes);
router.post("/createNote", auth, createNote);
router.delete("/:id", auth, deleteNote);
router.put('/updateNote/:id', auth, updateNote);

module.exports = router;
