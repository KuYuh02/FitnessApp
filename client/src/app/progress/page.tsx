'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import api from '@/lib/api';

interface PR {
  exercise_name: string;
  muscle_group: string;
  weight: number;
  reps: number;
  achieved_at: string;
}

export default function Progress() {
  const { user, isLoaded } = useUser();
  const [prs, setPRs] = useState<PR[]>([]);
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

  const muscleGroups = [...new Set(prs.map(pr => pr.muscle_group))];

  return (
    <main className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Personal Records</h1>
        <Link href="/dashboard" className="text-blue-600 hover:underline text-sm">
          ← Back to Dashboard
        </Link>
      </div>

      {loading && <p className="text-gray-500">Loading PRs...</p>}

      {!loading && prs.length === 0 && (
        <p className="text-gray-500">No PRs yet. Log some workouts to start tracking!</p>
      )}

      {muscleGroups.map(group => (
        <div key={group} className="mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">{group}</h2>
          <div className="space-y-2">
            {prs
              .filter(pr => pr.muscle_group === group)
              .map((pr, index) => (
                <div key={index} className="flex items-center justify-between border rounded-lg p-4 bg-white shadow-sm">
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