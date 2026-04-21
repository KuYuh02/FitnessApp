'use client';

import { useEffect, useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import Link from 'next/link';
import api from '@/lib/api';

interface Set {
  exercise_name: string;
  set_number: number;
  reps: number;
  weight: number;
}

interface Workout {
  id: number;
  name: string;
  date: string;
  notes: string;
  sets: Set[];
}

export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncAndFetch = async () => {
      if (!user) return;

      try {
        await api.post('/api/users/sync', {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress,
          name: user.fullName,
        });
      } catch (err) {
        console.error('Failed to sync user', err);
      }

      try {
        const res = await api.get(`/api/workouts/${user.id}`);
        setWorkouts(res.data);
      } catch (err) {
        console.error('Failed to fetch workouts', err);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) syncAndFetch();
  }, [isLoaded, user]);

  const deleteWorkout = async (id: number) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;
    try {
      await api.delete(`/api/workouts/${id}`);
      setWorkouts(workouts.filter(w => w.id !== id));
    } catch (err) {
      console.error('Failed to delete workout', err);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <Link
          href="/workouts/log"
          className="flex-1 bg-blue-600 text-white text-center rounded p-4 font-semibold hover:bg-blue-700"
        >
        + Log New Workout
        </Link>
        <Link
          href="/progress"
          className="flex-1 bg-purple-600 text-white text-center rounded p-4 font-semibold hover:bg-purple-700"
        > 
          🏆 Personal Records
        </Link>
      </div>

      <h2 className="text-xl font-semibold mb-4">Recent Workouts</h2>

      {loading && <p className="text-gray-500">Loading workouts...</p>}

      {!loading && workouts.length === 0 && (
        <p className="text-gray-500">No workouts logged yet. Start by logging your first workout!</p>
      )}

      <div className="space-y-4">
        {workouts.map(workout => (
          <div key={workout.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{workout.name}</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  {new Date(workout.date).toLocaleDateString()}
                </span>
                <button
                  onClick={() => deleteWorkout(workout.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
            {workout.notes && (
              <p className="text-gray-500 text-sm mb-3">{workout.notes}</p>
            )}
            <div className="space-y-1">
              {workout.sets && workout.sets
                .filter(s => s.exercise_name)
                .map((set, index) => (
                  <div key={index} className="text-sm text-gray-700">
                    <span className="font-medium">{set.exercise_name}</span>
                    <span className="text-gray-500 ml-2">
                      Set {set.set_number} — {set.reps} reps @ {set.weight} lbs
                    </span>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}