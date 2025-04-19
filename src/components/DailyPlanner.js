import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function DailyPlanner({ user }) {
  const [events, setEvents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [form, setForm] = useState({ title: '', time: '' });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'events'),
      where('userId', '==', user.uid),
      where('date', '==', date)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData = [];
      snapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() });
      });
      setEvents(eventsData);
    });
    return () => unsubscribe();
  }, [user, date]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      const eventRef = doc(db, 'events', editingId);
      await updateDoc(eventRef, form);
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'events'), { ...form, userId: user.uid, date });
    }
    setForm({ title: '', time: '' });
  };

  const handleEdit = (event) => {
    setForm({ title: event.title, time: event.time });
    setEditingId(event.id);
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Daily Planner</h2>
      <input
        type="date"
        className="mb-4 p-2 border border-gray-300 rounded w-full"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <form onSubmit={handleSubmit} className="space-y-3 mb-4">
        <input
          type="text"
          name="title"
          placeholder="Event Title"
          className="w-full p-2 border border-gray-300 rounded"
          value={form.title}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="time"
          className="w-full p-2 border border-gray-300 rounded"
          value={form.time}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {editingId ? 'Update Event' : 'Add Event'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ title: '', time: '' });
            }}
            className="ml-2 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
          >
            Cancel
          </button>
        )}
      </form>
      <ul>
        {events.map((event) => (
          <li key={event.id} className="border border-gray-300 rounded p-3 mb-2 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{event.title}</h3>
              <p className="text-sm text-gray-600">{event.time}</p>
            </div>
            <button
              onClick={() => handleEdit(event)}
              className="text-blue-600 hover:underline"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
