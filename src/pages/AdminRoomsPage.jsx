import React, { useEffect, useState } from 'react';
import axios from 'axios';

const AdminRoomsPage = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [tables, setTables] = useState([]);

  useEffect(() => {
    axios.get('/api/admin/rooms')
      .then(response => {
        setRooms(response.data);
        if (response.data.length > 0) {
          setSelectedRoomId(response.data[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (selectedRoomId) {
      axios.get(`/api/admin/rooms/${selectedRoomId}/tables`)
        .then(response => setTables(response.data));
    }
  }, [selectedRoomId]);

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Управление комнатами</h1>

      {/* Выпадающий список комнат */}
      <select
        className="mb-6 p-2 rounded bg-gray-800 text-white"
        value={selectedRoomId || ''}
        onChange={(e) => setSelectedRoomId(e.target.value)}
      >
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>{room.name}</option>
        ))}
      </select>

      {/* Карточки столов */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tables.map((table) => (
          <div key={table.id} className="bg-gray-800 p-4 rounded-lg shadow-md">
            <img
              src={table.stringUrl || '/placeholder.jpg'}
              alt={table.label}
              className="w-full h-32 object-cover rounded"
            />
            <h3 className="text-lg font-semibold mt-2">{table.label}</h3>
            <p className="text-sm">{table.description}</p>
            <p className="text-sm">Мест: {table.seats}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminRoomsPage;
