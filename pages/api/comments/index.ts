// pages/api/comments/index.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { case_id, user_id, user_name, content } = req.body;

  if (!case_id || !user_id || !content) {
    res.status(400).json({ message: 'Missing fields' });
    return;
  }

  const dbPath = path.join(process.cwd(), 'database', 'my-support-app.db');
  let db;

  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    const result = await db.run(
      'INSERT INTO comments (case_id, user_id, user_name, content, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
      [case_id, user_id, user_name, content]
    );

    // Assuming you have `id`, `case_id`, `user_id`, `user_name`, `content`, and `created_at` fields in your 'comments' table
    const newComment = await db.get('SELECT * FROM comments WHERE id = ?', result.lastID);

    res.status(201).json(newComment);

  } catch (error) {
    console.error('Failed to insert new comment', error);
    res.status(500).json({ message: 'Failed to insert new comment' });
  } finally {
    if (db) {
      await db.close();
    }
  }
}