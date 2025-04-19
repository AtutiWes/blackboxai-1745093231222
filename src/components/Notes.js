import React, { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import ReactMarkdown from 'react-markdown';

export default function Notes({ user }) {
  const [notes, setNotes] = useState([]);
  const [form, setForm] = useState({ title: '', content: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notes'),
      where('userId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesData = [];
      snapshot.forEach((doc) => {
        notesData.push({ id: doc.id, ...doc.data() });
      });
      setNotes(notesData);
    });
    return () => unsubscribe();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      const noteRef = doc(db, 'notes', editingId);
      await updateDoc(noteRef, form);
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'notes'), { ...form, userId: user.uid });
    }
    setForm({ title: '', content: '' });
  };

  const handleEdit = (note) => {
    setForm({ title: note.title, content: note.content });
    setEditingId(note.id);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'notes', id));
    if (editingId === id) {
      setEditingId(null);
      setForm({ title: '', content: '' });
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Notes</h2>
      <form onSubmit={handleSubmit} className="space-y-3 mb-4">
        <input
          type="text"
          name="title"
          placeholder="Title"
          className="w-full p-2 border border-gray-300 rounded"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="content"
          placeholder="Content (Markdown supported)"
          className="w-full p-2 border border-gray-300 rounded"
          value={form.content}
          onChange={handleChange}
          rows={5}
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          {editingId ? 'Update Note' : 'Add Note'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ title: '', content: '' });
            }}
            className="ml-2 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
          >
            Cancel
          </button>
        )}
      </form>
      <ul>
        {notes.map((note) => (
          <li key={note.id} className="border border-gray-300 rounded p-3 mb-2">
            <h3 className="font-semibold">{note.title}</h3>
            <ReactMarkdown className="prose">{note.content}</ReactMarkdown>
            <div className="mt-2 space-x-2">
              <button
                onClick={() => handleEdit(note)}
                className="text-purple-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(note.id)}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
