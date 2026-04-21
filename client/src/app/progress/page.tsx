'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import api from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PR {
  exercise_id: number;
  exercise_name: string;
  muscle_group: string;
  weight: number;
  reps: number;
  achieved_at: string;
}

interface HistoryEntry {
  weight: number;
  reps: number;
  date: string;
  exercise_name: string;
}

export default function Progress() {
  const { user, isLoaded } = useUser();
  const [prs, setPRs] = useState<PR[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<PR | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPRs = async () => {
      if (!user) return;
      try {
        const res = await api.get(`/api/progress/${user.id}`);
        setPRs(res.data);
      } catch (err) {
        console.error('Failed to fetch PRs', err);
      } finally {
        setLoading(false);
      }
    };

    if (isLoaded && user) fetchPRs();
  }, [isLoaded, user]);

  const fetchHistory = async (pr: PR) => {
    if (!user) return;
    setSelectedExercise(pr);
    try {
      const res = await api.get(`/api/progress/${user.id}/history/${pr.exercise_id}`);
      const formatted = res.data.map((entry: HistoryEntry) => ({
        ...entry,
        date: new Date(entry.date).toLocaleDateString(),
      }));
      setHistory(formatted);
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const muscleGroups = [...new Set(prs.map(pr => pr.muscle_group))];

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Personal Records</h1>

      {loading && <p className="text-gray-500">Loading PRs...</p>}

      {!loading && prs.length === 0 && (
        <p className="text-gray-500">No PRs yet. Log some workouts to start tracking!</p>
      )}

      {/* Chart */}
      {selectedExercise && history.length > 0 && (
        <div className="mb-8 bg-white border rounded-lg p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            {selectedExercise.exercise_name} — Weight Over Time
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis unit=" lbs" tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [`${value} lbs`, 'Weight']} />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* PR List */}
      {muscleGroups.map(group => (
        <div key={group} className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">{group}</h2>
          <div className="space-y-2">
            {prs
              .filter(pr => pr.muscle_group === group)
              .map((pr, index) => (
                <div
                  key={index}
                  onClick={() => fetchHistory(pr)}
                  className={`flex items-center justify-between border rounded-lg p-4 bg-white shadow-sm cursor-pointer hover:border-blue-400 transition-colors ${
                    selectedExercise?.exercise_name === pr.exercise_name
                      ? 'border-blue-500 bg-blue-50'
                      : ''
                  }`}
                >
                  <div>
                    <p className="font-semibold">{pr.exercise_name}</p>
                    <p className="text-sm text-gray-500">
                      {pr.reps} reps @ {pr.weight} lbs
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{pr.weight} lbs</p>
                    <p className="text-xs text-gray-400">
                      {new Date(pr.achieved_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </main>
  );
}