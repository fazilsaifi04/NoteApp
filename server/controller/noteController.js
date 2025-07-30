const Note = require("../models/Note");

exports.getNotes = async (req, res) => {
  try {
    console.log("User Info:", req.user.name, req.user.email);
    const notes = await Note.find({ userId: req.user.id });
    res.status(200).json({
      user: { name: req.user.name, email: req.user.email },
      notes,
    });
  } catch (err) {
    console.error("Error fetching notes:", err);
    res.status(500).json({ error: "Server error fetching notes" });
  }
};

exports.createNote = async (req, res) => {
  console.log("📥 Note creation request:", req.body);
  console.log("🧑‍💻 Authenticated user:", req.user);

  const { title, content } = req.body;

  if (!title || !content)
    return res.status(400).json({ error: "Title and content required" });

  try {
    const newNote = new Note({
      title,
      content,
      userId: req.user.id,
    });

    await newNote.save();
    console.log("✅ Note saved:", newNote);

    res.status(201).json(newNote);
  } catch (err) {
    console.error("❌ Error creating note:", err);
    res.status(500).json({ error: "Server error creating note" });
  }
};

exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!note) {
      return res.status(404).json({ error: "Note not found or unauthorized" });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (err) {
    console.error("Error deleting note:", err);
    res.status(500).json({ error: "Server error deleting note" });
  }
};

exports.updateNote = async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  try {
    const updatedNote = await Note.findByIdAndUpdate(
      id,
      { title, content },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json(updatedNote);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Failed to update note" });
  }
};
