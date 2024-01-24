// src/database/connect.ts
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

export async function connectToDatabase() {
    const db = await open({
        filename: './my-support-app.db',
        driver: sqlite3.Database
    });

    return db;
}