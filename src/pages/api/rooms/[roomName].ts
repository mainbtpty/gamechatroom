import { NextApiRequest, NextApiResponse } from 'next';
import redis from '@/lib/redis'; // Import Redis client

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roomName } = req.query;

  if (!roomName || typeof roomName !== 'string') {
    return res.status(400).json({ error: 'Invalid room name.' });
  }

  if (req.method === 'POST') {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required.' });
    }

    try {
      // Add the user to the room
      await redis.hset(
        `room:${roomName}`,
        username,
        JSON.stringify({ username, joinedAt: new Date().toISOString() })
      );
      res.status(200).json({ message: 'User added to room successfully.' });
    } catch (error) {
      console.error('Error adding user to room:', error);
      res.status(500).json({ error: 'Failed to add user to room.' });
    }
  } else if (req.method === 'GET') {
    try {
      // Fetch the list of users in the room
      const users = await redis.hgetall(`room:${roomName}`);
      const parsedUsers = Object.values(users).map((user) => JSON.parse(user));
      res.status(200).json(parsedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users.' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed.' });
  }
}
