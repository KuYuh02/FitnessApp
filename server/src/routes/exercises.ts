import { Router, Request, Response } from 'express';
import { query } from '../db/index';

const router = Router();

// Get all exercises
router.get('/', async (req: Request, res: Response) => {
  try {
    const result = await query(`SELECT * FROM exercises ORDER BY name ASC`);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
});

// Add a new exercise
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, muscle_group } = req.body;
    const result = await query(
      `INSERT INTO exercises (name, muscle_group) VALUES ($1, $2) RETURNING *`,
      [name, muscle_group]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create exercise' });
  }
});

export default router;