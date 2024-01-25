// database/init-db.ts
const sqlite3 = require('sqlite3').verbose();
import { open } from 'sqlite';
const path = require('path');

// Setup database path
const databasePath = path.join(__dirname, 'my-support-app.db');

// Create tables
const createUsersTable = `
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
email TEXT UNIQUE NOT NULL,
password TEXT NOT NULL,
user_name TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const createSupportCasesTable = `
CREATE TABLE IF NOT EXISTS support_cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Open', 'In Progress', 'Closed')) DEFAULT 'Open',
  file_path TEXT, -- New column for file storage
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
`;

const createCommentsTable = `
CREATE TABLE IF NOT EXISTS comments (
id INTEGER PRIMARY KEY AUTOINCREMENT,
case_id INTEGER NOT NULL,
user_id INTEGER NOT NULL,
content TEXT NOT NULL,
user_name TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
FOREIGN KEY (case_id) REFERENCES support_cases (id) ON DELETE CASCADE,
FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
`;

// Initializes a new database connection
// This will create the database file if it does not exist
const db = new sqlite3.Database(databasePath, (err: Error | null ) => {
  if (err) {
    console.error('Error opening database', err);
    return;
  }

  // Serial execution of queries to create tables
  db.serialize(() => {
    db.run(createUsersTable, (err: Error | null) => {
      if (err) console.error('Error creating users table', err);
    });

    db.run(createSupportCasesTable, (err: Error | null) => {
      if (err) console.error('Error creating support_cases table', err);
    });

    db.run(createCommentsTable, (err: Error | null) => {
      if (err) console.error('Error creating comments table', err);
    });
  });

  db.close((err: Error | null) => {
    if (err) {
      console.error('Error closing database', err);
    } else {
      console.log('Database initialized and tables created.');
    }
  });
});



export {};