// src/pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import path from 'path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';

export default async function login(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const dbPath = path.join(process.cwd(), 'database', 'my-support-app.db');
  let db;

  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    const user = await db.get('SELECT id, email, user_name, password FROM users WHERE email = ?', email);

    if (user && (await bcrypt.compare(password, user.password))) {
      // You can omit sensitive data from the token if needed, but ensure necessary info for authorization is included
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      // Respond with the token and the user's email, user_name, and id
      res.status(200).json({
        token,
        user_id: user.id,
        user_email: user.email,
        user_name: user.user_name // Make sure this column exists in your users table
      });
    } else {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  } finally {
    if (db) {
      await db.close();
    }
  }
}