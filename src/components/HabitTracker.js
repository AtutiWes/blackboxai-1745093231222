import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

export default function HabitTracker({ user }) {
  const [habits, setHabits] = useState([]);
  const [form, setForm] = useState({ name: '', streak: 0 });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'habits'),
      where('userId', '==', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const habitsData = [];
      snapshot.forEach((doc) => {
        habitsData.push({ id: doc.id, ...doc.data() });
      });
      setHabits(habitsData);
    });
    return () => unsubscribe();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdate = async (e) => {
    e.preventDefault();
    if (editingId) {
      const habitRef = doc(db, 'habits', editingId);
      await updateDoc(habitRef, form);
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'habits'), { ...form, userId: user.uid });
    }
    setForm({ name: '', streak: 0 });
  };

  const handleEdit = (habit) => {
    setForm({ name: habit.name, streak: habit.streak });
    setEditingId(habit.id);
  };

  const incrementStreak = async (habit) => {
    const habitRef = doc(db, 'habits', habit.id);
    await updateDoc(habitRef, { streak: habit.streak + 1 });
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Habit Tracker</h2>
      <form onSubmit={handleAddOrUpdate} className="space-y-3 mb-4">
        <input
          type="text"
          name="name"
          placeholder="Habit Name"
          className="w-full p-2 border border-gray-300 rounded"
          value={form.name}
          onChange={handleChange}
          required
        />
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
        >
          {editingId ? 'Update Habit' : 'Add Habit'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ name: '', streak: 0 });
            }}
            className="ml-2 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
          >
            Cancel
          </button>
        )}
      </form>
      <ul>
        {habits.map((habit) => (
          <li
            key={habit.id}
            className="border border-gray-300 rounded p-3 mb-2 flex justify-between items-center"
          >
            <div>
              <h3 className="font-semibold">{habit.name}</h3>
              <p className="text-sm text-gray-600">Streak: {habit.streak}</p>
            </div>
            <button
              onClick={() => incrementStreak(habit)}
              className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
            >
              +1
            </button>
            <button
              onClick={() => handleEdit(habit)}
              className="text-green-600 hover:underline ml-2"
            >
              Edit
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
