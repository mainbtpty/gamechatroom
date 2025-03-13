import { useEffect, useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { io } from "socket.io-client";

type RoomInfo = {
  num_participants: number;
  hasPasswd: boolean;
  maxParticipants: number;
};

type Props = {
  roomName: string;
  join?: boolean;
};

const DEFAULT_ROOM_INFO: RoomInfo = { num_participants: 0, hasPasswd: false, maxParticipants: 0 };

export function RoomInfo({ roomName, join }: Props) {
  const [roomInfo, setRoomInfo] = useState<RoomInfo>(DEFAULT_ROOM_INFO);
  const [roomNames, setRoomNames] = useState<string[]>([]);
  const { t } = useTranslation();

  const fetchRoomInfo = useCallback(async () => {
    const res = await fetch(`/api/info?roomName=${roomName}`);
    const _roomInfo = (await res.json()) as RoomInfo;
    setRoomInfo(_roomInfo);
  }, [roomName]);

  useEffect(() => {
    const socket = io('http://localhost:3001');

    // Listen for room list updates
    socket.on('updateRoomList', (rooms: string[]) => {
      setRoomNames(rooms);
    });

    // Fetch room info if joining
    if (join) {
      fetchRoomInfo();
    } else {
      const interval = setInterval(fetchRoomInfo, 5000);
      return () => clearInterval(interval);
    }

    return () => {
      socket.disconnect();
    };
  }, [join, fetchRoomInfo]);

  const humanRoomName = useMemo(() => {
    return decodeURI(roomName);
  }, [roomName]);

  if (!roomName) return null;

  return (
    <div className="flex justify-around w-full">
      <div className="flex flex-col items-center">
        <span className="text-lg">{t('room.roomName')}</span>
        <span className="font-bold text-6xl font-mono">{humanRoomName}</span>
      </div>

      <div className="pl-2 flex flex-col items-center">
        <span className="text-lg">{t('room.membersNum')}</span>
        <span className="text-6xl font-mono countdown">
          <span style={{ "--value": roomInfo.num_participants } as any}></span>
        </span>
      </div>

      {roomInfo.maxParticipants > 0 && (
        <div className="pl-2 flex flex-col items-center">
          <span className="text-lg">{t('room.capacity')}</span>
          <span className="text-6xl font-mono countdown">
            <span style={{ "--value": roomInfo.maxParticipants } as any}></span>
          </span>
        </div>
      )}

      {roomInfo.hasPasswd && (
        <div className="pl-2 flex flex-col justify-center items-center">
          <span className="text-lg text-primary">⚠️ {t('room.needPasswd')}</span>
        </div>
      )}

      {/* Display available rooms */}
      <div className="room-info">
        <h2>{t('room.availableRooms')}</h2>
        <ul>
          {roomNames.map((roomName) => (
            <li key={roomName}>{decodeURI(roomName)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
