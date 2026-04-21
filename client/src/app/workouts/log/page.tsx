'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Exercise {
  id: number;
  name: string;
  muscle_group: string;
}

interface SetEntry {
  exercise_id: number;
  exercise_name: string;
  set_number: number;
  reps: number;
  weight: number;
}

export default function LogWorkout() {
  const { user } = useUser();
  const router = useRouter();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutName, setWorkoutName] = useState('');
  const [notes, setNotes] = useState('');
  const [sets, setSets] = useState<SetEntry[]>([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const res = await api.get('/api/exercises');
        setExercises(res.data);
      } catch (err) {
        setError('Failed to load exercises');
      }
    };
    fetchExercises();
  }, []);

  const addSet = () => {
    if (!selectedExercise || !reps || !weight) {
      setError('Please fill in exercise, reps, and weight');
      return;
    }
    setError('');
    const exercise = exercises.find(e => e.id === parseInt(selectedExercise));
    if (!exercise) return;

    const exerciseSets = sets.filter(s => s.exercise_id === exercise.id);

    setSets([...sets, {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      set_number: exerciseSets.length + 1,
      reps: parseInt(reps),
      weight: parseFloat(weight),
    }]);

    setReps('');
    setWeight('');
  };

  const removeSet = (index: number) => {
    setSets(sets.filter((_, i) => i !== index));
  };

  const submitWorkout = async () => {
    if (!workoutName) {
      setError('Please enter a workout name');
      return;
    }
    if (sets.length === 0) {
      setError('Please add at least one set');
      return;
    }
    setLoading(true);
    setError('');

    try {
      await api.post('/api/workouts', {
        user_id: user?.id,
        name: workoutName,
        notes,
        sets,
      });
      router.push('/dashboard');
    } catch (err) {
      setError('Failed to save workout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Log Workout</h1>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Workout Name */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Workout Name</label>
        <input
          type="text"
          placeholder="e.g. Push Day, Leg Day..."
          value={workoutName}
          onChange={e => setWorkoutName(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Notes (optional)</label>
        <textarea
          placeholder="How did the workout feel?"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full border rounded p-2"
          rows={2}
        />
      </div>

      {/* Add Set */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h2 className="text-lg font-semibold mb-3">Add Set</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div className="sm:col-span-1 flex items-end">
            <label className="block text-sm font-medium mb-1">Exercise</label>
            <select
              value={selectedExercise}
              onChange={e => setSelectedExercise(e.target.value)}
              className="w-full border rounded p-2"
            >
              <option value="">Select exercise...</option>
              {exercises.map(e => (
                <option key={e.id} value={e.id}>
                  {e.name} — {e.muscle_group}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reps</label>
            <input
              type="number"
              placeholder="10"
              value={reps}
              onChange={e => setReps(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Weight (lbs)</label>
            <input
              type="number"
              placeholder="135"
              value={weight}
              onChange={e => setWeight(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={addSet}
              className="w-full bg-blue-600 text-white rounded p-2 font-medium hover:bg-blue-700"
            >
              Add Set
            </button>
          </div>
        </div>
      </div>

      {/* Sets List */}
      {sets.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Sets Added</h2>
          <div className="space-y-2">
            {sets.map((set, index) => (
              <div key={index} className="flex items-center justify-between bg-white border rounded p-3">
                <div>
                  <span className="font-medium">{set.exercise_name}</span>
                  <span className="text-gray-500 text-sm ml-2">
                    Set {set.set_number} — {set.reps} reps @ {set.weight} lbs
                  </span>
                </div>
                <button
                  onClick={() => removeSet(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      <button
        onClick={submitWorkout}
        disabled={loading}
        className="w-full bg-green-600 text-white rounded p-3 font-semibold hover:bg-green-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : 'Save Workout'}
      </button>
    </main>
  );
}