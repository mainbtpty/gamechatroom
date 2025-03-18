import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL, // Use environment variable
});

redisClient.connect().catch(console.error);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { type } = req.query;

    try {
      if (type === 'rooms') {
        const keys = await redisClient.keys('room:*:timestamp');
        const roomNames = keys.map((key: string) => key.split(':')[1]);
        return res.status(200).json(roomNames);
      } else if (type === 'users') {
        const keys = await redisClient.keys('user:*');
        const users = keys.map((key: string) => key.split(':')[1]);
        return res.status(200).json(users);
      } else {
        return res.status(400).json({ message: 'Invalid type. Use ?type=rooms or ?type=users' });
      }
    } catch (error) {
      console.error('Redis Error:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } else if (req.method === 'POST') {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    try {
      await redisClient.set(`user:${username}`, 'online', { EX: 3600 });
      return res.status(201).json({ message: 'User added' });
    } catch (error) {
      console.error('Error adding user:', error);
      return res.status(500).json({ message: 'Error adding user' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
