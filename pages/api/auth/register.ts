// src/pages/api/auth/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';
import path from 'path';

export default async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { email, password } = req.body;
        
        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Using path.resolve to get the absolute path to the database file
        const dbPath = path.resolve('database/my-support-app.db');
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // Check if the user already exists
        const existingUser = await db.get(
            `SELECT id FROM users WHERE email = ?`,
            email.toLowerCase()
        );

        if (existingUser) {
            return res.status(409).json({ message: 'User already exists with this email' });
        }

        // Hash the user's password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await db.run(
            `INSERT INTO users (email, password) VALUES (?, ?)`,
            email.toLowerCase(), // Store emails in lowercase to ensure uniqueness
            hashedPassword
        );

        // Create a token for the new user
        const userId = result.lastID;
        const token = jwt.sign(
            { userId, email: email.toLowerCase() },
            process.env.JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(201).json({ userId, token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    } finally {
        if (db) {
            db.close();
        }
    }
};