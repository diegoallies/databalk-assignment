// src/pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';
import path from 'path';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        // This will set the "Allow" header correctly before returning.
        res.setHeader('Allow', ['POST']);
        return res.status(405).end('Method Not Allowed');
    }

    const { email, password, user_name } = req.body;
    
    // Basic validation
    if (!email || !password || !user_name) {
        return res.status(400).json({ message: 'Email, password, and username are required' });
    }

    // Using path.resolve to get the absolute path to the database file
    const dbPath = path.resolve('database/my-support-app.db');
    
    let db;
    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // Rest of your logic...
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
        return; // Add return here
    }

    try {
        const existingUser = await db.get(`SELECT id FROM users WHERE email = ?`, email.toLowerCase());

        if (existingUser) {
            return res.status(409).json({ message: 'User already exists with this email' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.run(
            `INSERT INTO users (email, password, user_name) VALUES (?, ?, ?)`,
            email.toLowerCase(),
            hashedPassword,
            user_name
        );

        const userId = result.lastID;
        const token = jwt.sign(
            { userId, email: email.toLowerCase() },
            process.env.JWT_SECRET || '',
            { expiresIn: '2h' }
        );

        res.status(201).json({ userId, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    } finally {
        if (db) {
            await db.close(); // Make sure to await the db.close() call
        }
    }
}