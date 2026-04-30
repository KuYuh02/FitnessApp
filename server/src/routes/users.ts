import { Router, Request, Response } from 'express';
import { query } from '../db/index';

const router = Router();

// Create or update user on login
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const { id, email, name } = req.body;
    await query(
      `INSERT INTO users (id, email, name) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (id) DO UPDATE SET email = $2, name = $3`,
      [id, email, name]
    );
    res.status(200).json({ message: 'User synced' });
  } catch (error) {
    // If email conflict, update the existing user's id
    try {
      await query(
        `UPDATE users SET id = $1, name = $3 WHERE email = $2`,
        [id, email, name]
      );
      res.status(200).json({ message: 'User synced' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to sync user' });
    }
  }
});

export default router;