import React, { useState, useEffect } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebaseConfig';

const priorities = ['Low', 'Medium', 'High'];
const statuses = ['Pending', 'In Progress', 'Completed'];

export default function ToDoList({ user }) {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    priority: 'Medium',
    status: 'Pending',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'tasks'),
      where('userId', '==', user.uid),
      orderBy('deadline', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksData = [];
      snapshot.forEach((doc) => {
        tasksData.push({ id: doc.id, ...doc.data() });
      });
      setTasks(tasksData);
    });
    return () => unsubscribe();
  }, [user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      const taskRef = doc(db, 'tasks', editingId);
      await updateDoc(taskRef, form);
      setEditingId(null);
    } else {
      await addDoc(collection(db, 'tasks'), { ...form, userId: user.uid });
    }
    setForm({
      title: '',
      description: '',
      deadline: '',
      priority: 'Medium',
      status: 'Pending',
    });
  };

  const handleEdit = (task) => {
    setForm({
      title: task.title,
      description: task.description,
      deadline: task.deadline,
      priority: task.priority,
      status: task.status,
    });
    setEditingId(task.id);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'tasks', id));
    if (editingId === id) {
      setEditingId(null);
      setForm({
        title: '',
        description: '',
        deadline: '',
        priority: 'Medium',
        status: 'Pending',
      });
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">To-Do List</h2>
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
          name="description"
          placeholder="Description"
          className="w-full p-2 border border-gray-300 rounded"
          value={form.description}
          onChange={handleChange}
          rows={3}
        />
        <input
          type="date"
          name="deadline"
          className="w-full p-2 border border-gray-300 rounded"
          value={form.deadline}
          onChange={handleChange}
          required
        />
        <select
          name="priority"
          className="w-full p-2 border border-gray-300 rounded"
          value={form.priority}
          onChange={handleChange}
        >
          {priorities.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <select
          name="status"
          className="w-full p-2 border border-gray-300 rounded"
          value={form.status}
          onChange={handleChange}
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {editingId ? 'Update Task' : 'Add Task'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({
                title: '',
                description: '',
                deadline: '',
                priority: 'Medium',
                status: 'Pending',
              });
            }}
            className="ml-2 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
          >
            Cancel
          </button>
        )}
      </form>
      <ul>
        {tasks.map((task) => (
          <li
            key={task.id}
            className="border border-gray-300 rounded p-3 mb-2 flex flex-col md:flex-row md:items-center md:justify-between"
          >
            <div>
              <h3 className="font-semibold">{task.title}</h3>
              <p className="text-sm text-gray-600">{task.description}</p>
              <p className="text-sm">
                Deadline: {task.deadline} | Priority: {task.priority} | Status: {task.status}
              </p>
            </div>
            <div className="mt-2 md:mt-0 space-x-2">
              <button
                onClick={() => handleEdit(task)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(task.id)}
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
