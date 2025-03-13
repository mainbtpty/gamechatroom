import { NextApiRequest, NextApiResponse } from 'next';
import redis from '@/lib/redis';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { roomName } = req.query;

  if (req.method === 'POST') {
    const { username, message } = req.body;

    if (!roomName || !username || !message) {
      return res.status(400).json({ error: 'Room name, username, and message are required.' });
    }

    try {
      // Publish the message to the Redis channel
      await redis.publish(
        `chat:${roomName}`,
        JSON.stringify({ username, message, timestamp: new Date().toISOString() })
      );

      return res.status(200).json({ message: 'Message sent successfully.' });
    } catch (error) {
      console.error('Error publishing message to Redis:', error);
      return res.status(500).json({ error: 'Failed to send message.' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed.' });
  }
}
