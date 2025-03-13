import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Typist from 'react-typist-component';
import { withTranslation, WithTranslation } from 'react-i18next';

const HomeComponent: React.FC<WithTranslation> = ({ t, i18n }) => {
  const [roomIdText, setRoomIdText] = useState('');
  const [cursor] = useState('|');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    fetchOnlineUsers();
  }, []);

  const fetchOnlineUsers = async () => {
    try {
      const response = await fetch('/api/rooms?type=users'); // ✅ Corrected API endpoint
      if (response.ok) {
        const users = await response.json();
        setOnlineUsers(users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Function to handle clicking on a user
  const startChat = (username: string) => {
    alert(`Starting chat with ${username}`); // Replace with actual chat logic
  };

  return (
    <div className='Home flex justify-center items-center text-center mx-auto h-full w-full'>
      <div className='flex flex-col text-center justify-center'>
        {i18n.language === 'en' ? (
          <div>
            <div className='text-xl md:text-5xl mb-2 hidden sm:block'>
              G
              <Typist startDelay={1000} typingDelay={110} loop cursor={<span className='cursor'>{cursor}</span>}>
                ame Chat Room <Typist.Delay ms={1500} />
                <Typist.Backspace count={18} />
              </Typist>
            </div>
            <div className='text-xl md:text-5xl mb-2 block sm:hidden'>Game Chat Room</div>
          </div>
        ) : (
          <div className='text-xl md:text-5xl mb-2 block'>Betting Racing Car</div>
        )}
        <div className='mx-auto mt-8 max-w-xl sm:flex sm:gap-4 h-12'>
          <input
            placeholder={t('room.roomName')}
            value={roomIdText}
            onChange={(e) => setRoomIdText(e.target.value)}
            className='w-48 rounded-lg border-gray-200 bg-white p-3 text-gray-700 shadow-sm focus:border-white focus:outline-none focus:ring focus:ring-secondary-focus'
            style={{ marginRight: 10 }}
          />
          <Link href={`/${roomIdText}`}>
            <button className='font-bold btn-primary rounded-lg h-full w-20 border-none text-white'>
              👉 {t('Go')}
            </button>
          </Link>
        </div>
      </div>

      {/* Sidebar for Online Users */}
      <div className='absolute left-0 top-0 p-4 bg-white shadow-lg rounded-lg'>
        <h2 className='text-lg font-bold'>Online Users</h2>
        <ul className='list-disc pl-5'>
          {onlineUsers.length > 0 ? (
            onlineUsers.map((user, index) => (
              <li
                key={index}
                className='cursor-pointer text-blue-500 hover:underline'
                onClick={() => startChat(user)}
              >
                {user}
              </li>
            ))
          ) : (
            <li>No users online</li>
          )}
        </ul>
      </div>

      <footer className='text-white gap-2 fixed bottom-0 text-xs sm:text-xl h-12 w-full py-1 px-2 flex items-center justify-center text-center bg-primary'>
        Betting
        <a className='text-accent-focus' href='https://mainbtpty.github.io/p5-multiplayer-car-race-game/' rel='noopener'>
          Car Racing Page
        </a>
        .
      </footer>
    </div>
  );
};

export default withTranslation()(HomeComponent);
