import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import ToDoList from './ToDoList';
import DailyPlanner from './DailyPlanner';
import HabitTracker from './HabitTracker';
import Notes from './Notes';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (!user) {
    return null; // or loading spinner
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Productivity Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section>
          <ToDoList user={user} />
        </section>
        <section>
          <DailyPlanner user={user} />
        </section>
        <section>
          <HabitTracker user={user} />
        </section>
        <section>
          <Notes user={user} />
        </section>
      </main>
    </div>
  );
}
