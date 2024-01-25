// src/pages/api/auth/user.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcryptjs';
import path from 'path';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import jwt from 'jsonwebtoken';

export default async function user(req: NextApiRequest, res: NextApiResponse) {
    const dbPath = path.join(process.cwd(), 'database', 'my-support-app.db');
    let db;

    // Helper function to authenticate user with JWT
    const authenticateUser = (req) => {
        try {
            const authorizationHeader = req.headers.authorization || '';
            const token = authorizationHeader.split(' ')[1];
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return null;
        }
    };

    try {
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        // Extract the authenticated user's ID from the JWT token
        const authenticatedUser = authenticateUser(req);
        if (!authenticatedUser) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const userId = authenticatedUser.userId;

        // Handle different request methods
        switch (req.method) {
            case 'GET': {
                // Fetch user data
                const user = await db.get('SELECT id, email, user_name FROM users WHERE id = ?', userId);
                if (user) {
                    res.status(200).json(user);
                } else {
                    res.status(404).json({ message: 'User not found' });
                }
                break;
            }
            case 'PUT': {
                // Update user data
                const { email, user_name, newPassword } = req.body;
                const hashedPassword = newPassword ? await bcrypt.hash(newPassword, 10) : undefined;

                // Update only provided fields
                const updates = [];
                const values = [];
                if (email) {
                    updates.push('email = ?');
                    values.push(email.toLowerCase());
                }
                if (user_name) {
                    updates.push('user_name = ?');
                    values.push(user_name);
                }
                if (hashedPassword) {
                    updates.push('password = ?');
                    values.push(hashedPassword);
                }

                if (updates.length > 0) {
                    await db.run(`UPDATE users SET ${updates.join(',')} WHERE id = ?`, [...values, userId]);
                    res.status(200).json({ message: 'User updated successfully' });
                } else {
                    res.status(400).json({ message: 'No updates provided' });
                }
                break;
            }
            case 'DELETE': {
                // Delete user data
                await db.run('DELETE FROM users WHERE id = ?', userId);
                res.status(200).json({ message: 'User deleted successfully' });
                break;
            }
            default:
                res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('Database or server error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    } finally {
        if (db) {
            await db.close();
        }
    }
}