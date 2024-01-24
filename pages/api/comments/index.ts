// pages/api/comments/index.js

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await open({
    filename: path.join(process.cwd(), 'database', 'my-support-app.db'),
    driver: sqlite3.Database,
  });

  try {
    if (req.method === 'POST') {
      // Extract caseId and content from the request body
      const { caseId, content } = req.body;
      if (!caseId || !content) {
        res.status(400).json({ message: 'caseId and content are required' });
        return;
      }

      // Insert the new comment into the database
      const result = await db.run(
        'INSERT INTO comments (case_id, content, created_at) VALUES (?, ?, datetime("now"))',
        [caseId, content]
      );

      // Get the newly inserted comment
      const newComment = await db.get('SELECT * FROM comments WHERE id = ?', [result.lastID]);

      // Send the new comment back to the client
      res.status(201).json(newComment);
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Failed to insert new comment', error });
  } finally {
    await db.close();
  }
}
