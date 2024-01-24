// pages/api/comments/[caseId].tsx

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function commentsHandler(req: NextApiRequest, res: NextApiResponse) {
  const { caseId } = req.query;

  let db;
  try {
    // Check for the method first
    if (req.method !== 'GET') {
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    // Check if the caseId is valid, else return a 400 Bad Request
    if (!caseId || typeof caseId !== 'number' || Array.isArray(caseId)) {
      console.error('Invalid case ID:', caseId);  // Log the invalid caseId for debugging
      res.status(400).json({ message: `Invalid case ID ${caseId}` });
      return;
    }

    db = await open({
      filename: path.join(process.cwd(), 'database', 'my-support-app.db'),
      driver: sqlite3.Database,
    });

    // Fetch the comments for the specified case ID from the database
    const comments = await db.all('SELECT * FROM comments WHERE case_id = ?', [caseId]);
    
    // Check if comments exist for the given caseId
    if (comments.length === 0) {
      // No comments found for the caseId
      res.status(404).json({ message: 'No comments found for this case ID' });
    } else {
      // Return the comments
      res.status(200).json(comments);
    }
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Failed to process request', error: err.message });
  } finally {
    if (db) {
      await db.close();
    }
  }
}