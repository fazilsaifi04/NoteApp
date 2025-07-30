import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import logo from "../assets/icon.png";
import instance from "../api/api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [user, setUser] = useState({ name: "", email: "" });
  const [notes, setNotes] = useState([]);
  const [showNotePad, setShowNotePad] = useState(false);
  const [noteContent, setNoteContent] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [editingNote, setEditingNote] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const res = await instance.get("/notes");
        setUser(res.data.user || {});
        setNotes(res.data.notes || []);
      } catch (err) {
        console.error("Error fetching user/notes:", err.response?.data || err.message);
        if (err.response?.status === 401) {
          navigate("/signup");
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleSaveNote = async () => {
    if (!noteContent.trim() || !noteTitle.trim()) return;

    try {
      if (editingNote) {
        const res = await instance.put(`/notes/updateNote/${editingNote._id}`, {
          title: noteTitle,
          content: noteContent,
        });

        setNotes((prev) =>
          prev.map((n) => (n._id === editingNote._id ? res.data : n))
        );
      } else {
        const res = await instance.post("/notes/createNote", {
          title: noteTitle,
          content: noteContent,
        });

        setNotes((prev) => [res.data, ...prev]);
      }

      // Reset form
      setNoteContent("");
      setNoteTitle("");
      setEditingNote(null);
      setShowNotePad(false);
    } catch (err) {
      console.error("Save note error:", err.response?.data || err.message);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await instance.delete(`/notes/${noteId}`);
      setNotes((prev) => prev.filter((note) => note._id !== noteId));
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
    }
  };

  const openNoteEditor = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setShowNotePad(true);
  };

  const handleSignOut = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  return (
    <div className="w-full min-h-screen bg-white px-4 py-6 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-sm flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="Logo" className="w-8 h-8" />
          <h1 className="text-xl font-semibold pl-8">Dashboard</h1>
        </div>
        <button
          onClick={handleSignOut}
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          Sign Out
        </button>
      </div>

      {/* User Info */}
      <div className="w-full max-w-sm bg-white shadow-md rounded-xl p-8 mb-8">
        <h2 className="text-lg font-semibold">Welcome, {user.name || "User"}!</h2>
        <p className="text-sm text-gray-500 mt-1">Email: {user.email}</p>
      </div>

      {/* Create Note */}
      <button
        onClick={() => {
          setNoteContent("");
          setNoteTitle("");
          setEditingNote(null);
          setShowNotePad(true);
        }}
        className="w-full max-w-sm h-[50px] bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg mb-6 transition"
      >
        Create Note
      </button>

      {/* Modal */}
      {showNotePad && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingNote ? "Edit Note" : "New Note"}
            </h2>

            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="Note Title"
              className="w-full mb-3 px-3 py-2 border border-gray-300 rounded"
            />

            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full h-40 p-2 border border-gray-300 rounded"
              placeholder="Write your note here..."
            ></textarea>

            <div className="flex justify-end mt-4 space-x-2">
              <button
                onClick={() => {
                  setShowNotePad(false);
                  setEditingNote(null);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                {editingNote ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="w-full max-w-sm">
        <h3 className="text-lg font-semibold mb-3">Notes</h3>
        <div className="space-y-3">
          {notes.length === 0 ? (
            <p className="text-sm text-gray-400 text-center">No notes yet.</p>
          ) : (
            notes.map((note) => (
              <div
                key={note._id}
                onClick={() => openNoteEditor(note)}
                className="bg-white shadow-md rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50 relative"
              >
                <div className="flex justify-between items-start">
                  <div className="overflow-hidden">
                    <h4 className="text-md font-bold text-gray-800 truncate">{note.title}</h4>
                    <p className="text-sm text-gray-600 line-clamp-2">{note.content}</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note._id);
                    }}
                    className="text-red-500 hover:text-red-700 ml-2"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
