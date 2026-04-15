import { Router, Request, Response } from 'express';
import { query } from '../db/index';

const router = Router();

// Get all workouts for a user
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await query(
      `SELECT w.*, 
        json_agg(
          json_build_object(
            'exercise_id', ws.exercise_id,
            'exercise_name', e.name,
            'set_number', ws.set_number,
            'reps', ws.reps,
            'weight', ws.weight
          )
        ) as sets
       FROM workouts w
       LEFT JOIN workout_sets ws ON w.id = ws.workout_id
       LEFT JOIN exercises e ON ws.exercise_id = e.id
       WHERE w.user_id = $1
       GROUP BY w.id
       ORDER BY w.date DESC`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch workouts' });
  }
});

// Create a new workout
router.post('/', async (req: Request, res: Response) => {
  try {
    const { user_id, name, notes, sets } = req.body;

    // Create the workout
    const workoutResult = await query(
      `INSERT INTO workouts (user_id, name, notes) VALUES ($1, $2, $3) RETURNING *`,
      [user_id, name, notes]
    );

    const workout = workoutResult.rows[0];

    // Insert each set
    for (const set of sets) {
      await query(
        `INSERT INTO workout_sets (workout_id, exercise_id, set_number, reps, weight)
         VALUES ($1, $2, $3, $4, $5)`,
        [workout.id, set.exercise_id, set.set_number, set.reps, set.weight]
      );

      // Update personal record if this is a new max weight
      await query(
        `INSERT INTO personal_records (user_id, exercise_id, weight, reps)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id, exercise_id)
         DO UPDATE SET weight = GREATEST(personal_records.weight, $3),
         achieved_at = NOW()`,
        [user_id, set.exercise_id, set.weight, set.reps]
      );
    }

    res.status(201).json(workout);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create workout' });
  }
});

// Delete a workout
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await query(`DELETE FROM workouts WHERE id = $1`, [id]);
    res.json({ message: 'Workout deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete workout' });
  }
});

export default router;