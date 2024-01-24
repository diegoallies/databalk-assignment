// pages/api/cases/[id].tsx
import type { NextApiRequest, NextApiResponse } from 'next';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

export default async function caseHandler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    res.status(400).json({ message: 'Invalid case ID' });
    return;
  }

  const db = await open({
    filename: path.join(process.cwd(), 'database', 'my-support-app.db'),
    driver: sqlite3.Database,
  });

  try {
    switch (req.method) {
      case 'GET':
        // Fetch the case with the given ID from the database
        const caseData = await db.get('SELECT * FROM support_cases WHERE id = ?', [id]);
        if (caseData) {
          res.json(caseData);
        } else {
          res.status(404).json({ message: 'Case not found' });
        }
        break;
      
      case 'PUT':
        // Update the case with the given ID
        const { title, description, status } = req.body;
        const update = await db.run(
          'UPDATE support_cases SET title = ?, description = ?, status = ? WHERE id = ?',
          [title, description, status, id],
        );
        if (update.changes > 0) {
          res.json({ message: 'Case updated successfully' });
        } else {
          res.status(404).json({ message: 'Case not found' });
        }
        break;

      case 'DELETE':
        // Delete the case with the given ID
        const deletion = await db.run('DELETE FROM support_cases WHERE id = ?', [id]);
        if (deletion.changes > 0) {
          res.json({ message: 'Case deleted successfully' });
        } else {
          res.status(404).json({ message: 'Case not found' });
        }
        break;

      default:
        // Handle other HTTP methods not supported
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).json({ message: 'Failed to process request', error: err.message });
  } finally {
    await db.close();
  }
}