import { NextApiRequest, NextApiResponse } from 'next';
import redis from 'redis';

const redisClient = redis.createClient();
redisClient.connect();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const rooms = await getRoomNames();
      res.status(200).json(rooms);
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

async function getRoomNames() {
  const keys = await redisClient.keys('room:*:timestamp');
  const roomNames = await Promise.all(keys.map(async (key) => {
    const roomName = key.split(':')[1];
    const timestamp = await redisClient.get(key);
    return { roomName, timestamp };
  }));
  return roomNames;
}
