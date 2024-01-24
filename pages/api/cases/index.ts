// src/pages/api/cases/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

async function connectToDatabase() {
  const dbPath = path.join(process.cwd(), 'database', 'my-support-app.db');
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = await connectToDatabase();

  try {
    // Guard clause for only allowing POST and GET requests
    if (!['POST', 'GET' , 'PUT'].includes(req.method!)) {
      res.setHeader('Allow', ['POST', 'GET', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      return;
    }

    // Extract and verify token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new Error('Authentication token required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    const { userId } = decoded;

    if (req.method === 'GET') {
      // Fetch all support cases
      const cases = await db.all('SELECT * FROM support_cases');
      res.status(200).json({ cases });
    } else if (req.method === 'POST') {
      // Create a new support case
      const { title, description } = req.body;
      const status = 'Open'; // Default status

      if (!title || !description) {
        throw new Error('Title and description are required');
      }

      const result = await db.run(
        'INSERT INTO support_cases (user_id, title, description, status) VALUES (?, ?, ?, ?)',
        userId,
        title,
        description,
        status
      );

      res.status(201).json({ caseId: result.lastID });
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: 'Invalid or expired token' });
    } else {
      console.error('Server error:', error);
      res.status(500).json({ message: error.message });
    }
  } finally {
    await db.close();
  }
}