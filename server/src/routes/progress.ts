import { Router, Request, Response } from 'express';
import { query } from '../db/index';

const router = Router();

router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await query(
      `SELECT 
      pr.exercise_id,
      e.name as exercise_name,
      e.muscle_group,
      pr.weight,
      pr.reps,
      pr.achieved_at
      FROM personal_records pr
      JOIN exercises e ON pr.exercise_id = e.id
      WHERE pr.user_id = $1
      ORDER BY e.muscle_group, e.name`,
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch personal records' });
  }
});

// Get weight history for a specific exercise
router.get('/:userId/history/:exerciseId', async (req: Request, res: Response) => {
  try {
    const { userId, exerciseId } = req.params;
    const result = await query(
      `SELECT 
        ws.weight,
        ws.reps,
        w.date,
        e.name as exercise_name
       FROM workout_sets ws
       JOIN workouts w ON ws.workout_id = w.id
       JOIN exercises e ON ws.exercise_id = e.id
       WHERE w.user_id = $1 AND ws.exercise_id = $2
       ORDER BY w.date ASC`,
      [userId, exerciseId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;