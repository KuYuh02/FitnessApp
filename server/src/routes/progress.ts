import { Router, Request, Response } from 'express';
import { query } from '../db/index';

const router = Router();

router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const result = await query(
      `SELECT 
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

export default router;