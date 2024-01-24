// src/pages/api/cases/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

// Function to connect to the database
async function connectToDatabase() {
  const dbPath = path.join(process.cwd(), 'database', 'my-support-app.db');
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}

// Main handler function
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Extract token from the Authorization header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication token required' });
    }
    
    // Verify JWT token and fetch user's ID
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
      userId = decoded.userId;
    } catch (error) {
      console.error('Failed to authenticate:', error);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    // Connect to the database
    const db = await connectToDatabase();

    if (req.method === 'GET') {
      // Fetch user's support cases
      const cases = await db.all('SELECT * FROM support_cases WHERE user_id = ?', userId);
      await db.close();
      res.status(200).json({ cases });
    } else if (req.method === 'POST') {
      // Create a new support case
      const { title, description } = req.body;
      const status = 'Open'; // default status
      const result = await db.run(
        'INSERT INTO support_cases (user_id, title, description, status) VALUES (?, ?, ?, ?)',
        userId,
        title,
        description,
        status
      );
      await db.close();
      res.status(201).json({ caseId: result.lastID });
    } else {
      // Handle unsupported methods
      await db.close();
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    // Log and return any server errors
    console.error('Server error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}