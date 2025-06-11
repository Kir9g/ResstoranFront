import React, { useEffect, useState } from "react";
import axios from "axios";
import { getToken } from '../utilis/auth.js'
import "../styles/AdminRoomManagementPage.scss";

export default function AdminRoomManagementPage() {
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const token = getToken();

  // Модалки
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isAddTableModalOpen, setAddTableModalOpen] = useState(false);
  const [isAddRoomModalOpen, setAddRoomModalOpen] = useState(false);
  const [isEditRoomModalOpen, setEditRoomModalOpen] = useState(false);

  // Форма стола
  const [tableForm, setTableForm] = useState({
    label: "",
    description: "",
    seats: 1,
    stringUrl: "",
  });
  const [tableImageFile, setTableImageFile] = useState(null); // для файла изображения

  // Форма комнаты
  const [roomName, setRoomName] = useState("");

  // Загрузка комнат при старте
  useEffect(() => {
      axios.get("/api/admin/rooms", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setRooms(res.data);
        if (res.data.length > 0) {
          setSelectedRoomId(res.data[0].id);
          setRoomName(res.data[0].name);
        }
      })
      .catch((error) => {
        console.error("Ошибка загрузки комнат:", error);
        alert("Ошибка загрузки комнат: " + error.response?.status);
      });
  }, []);

  // Загрузка столов при смене комнаты
  useEffect(() => {
    if (selectedRoomId !== null) {
      axios.get(`/api/admin/rooms/${selectedRoomId}/tables`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => {
        setTables(res.data);
        setSelectedTable(null);
        const currentRoom = rooms.find((r) => r.id === selectedRoomId);
        if (currentRoom) setRoomName(currentRoom.name);
      });
    } else {
      setTables([]);
    }
  }, [selectedRoomId, rooms]);

  // Удаление комнаты
  const deleteRoom = () => {
    if (!selectedRoomId) return;
    if (!window.confirm("Удалить комнату?")) return;

    axios.delete(`/api/admin/rooms/${selectedRoomId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(() => {
      setRooms((prev) => prev.filter((r) => r.id !== selectedRoomId));
      setSelectedRoomId(null);
      setTables([]);
      setRoomName("");
    });
  };

  // Удаление стола
  const deleteTable = (id) => {
    if (!window.confirm("Удалить стол?")) return;

    axios.delete(`/api/admin/tables/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then(() => {
      setTables((prev) => prev.filter((t) => t.id !== id));
      setSelectedTable(null);
      setTableForm({ label: "", description: "", seats: 1, stringUrl: "" });
      setTableImageFile(null);
    });
  };


  // Сохранение изменений стола
  const handleEditTable = async () => {
    try {
      const formData = new FormData();
      formData.append("label", tableForm.label);
      formData.append("description", tableForm.description);
      formData.append("seats", tableForm.seats);
      formData.append("roomId", selectedRoomId);  // сюда передаём roomId
      if (tableImageFile) {
        formData.append("image", tableImageFile);
      }

      const res = await axios.put(
        `/api/admin/tables/${selectedTable.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );

      setTables((prev) =>
        prev.map((t) =>
          t.id === selectedTable.id ? res.data : t
        )
      );
      setEditModalOpen(false);
      setSelectedTable(null);
      setTableForm({ label: "", description: "", seats: 1, stringUrl: "" });
      setTableImageFile(null);
    } catch (error) {
      console.error("Ошибка при обновлении стола:", error);
      alert("Ошибка при обновлении стола");
    }
  };



  // Добавление нового стола
  const handleAddTable = async () => {
    try {
      const formData = new FormData();
      formData.append("label", tableForm.label);
      formData.append("description", tableForm.description);
      formData.append("seats", tableForm.seats);
      formData.append("roomId", selectedRoomId);  // сюда передаём roomId
      if (tableImageFile) {
        formData.append("image", tableImageFile); // ключ должен совпадать с @RequestParam на бэкенде
      }

      const res = await axios.post(
        `/api/admin/tables`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
        }
      );

      setTables((prev) => [...prev, res.data]);
      setAddTableModalOpen(false);
      setTableForm({ label: "", description: "", seats: 1, stringUrl: "" });
      setTableImageFile(null);
    } catch (error) {
      console.error("Ошибка при добавлении стола:", error);
      alert("Ошибка при добавлении стола");
    }
  };

  // Добавление комнаты
  const handleAddRoom = () => {
    if (!roomName.trim()) {
      alert("Введите название комнаты");
      return;
    }
    axios.post(`/api/admin/rooms`, { name: roomName }, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((res) => {
      setRooms((prev) => [...prev, res.data]);
      setSelectedRoomId(res.data.id);
      setAddRoomModalOpen(false);
      setRoomName("");
    });
  };

  // Редактирование комнаты
  const handleEditRoom = () => {
    if (!roomName.trim()) {
      alert("Введите название комнаты");
      return;
    }
    axios.put(`/api/admin/rooms/${selectedRoomId}`, { name: roomName }, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => {
      setRooms((prev) =>
        prev.map((room) => (room.id === selectedRoomId ? { ...room, name: roomName } : room))
      );
      setEditRoomModalOpen(false);
    });
  };

  // Обновляем форму при выборе стола
  const selectTable = (table) => {
    setSelectedTable(table);
    setTableForm(table);
    setTableImageFile(null);
  };

  // Получение корректного URL для картинки стола
  function getTableImageUrl(table) {
    const baseUrl = "http://localhost:8080"; // или адрес вашего бэкенда
    if (!table.imageUrl) return "/default-table-image.png"; // заглушка, если нет фото
    // Если imageUrl уже абсолютный, возвращаем как есть, иначе добавляем базовый URL
    if (table.imageUrl.startsWith("http")) {
      return table.imageUrl;
    }
    return baseUrl + table.imageUrl;
  };

  return (
    <div className="admin-room-page">
      <h1>Управление комнатами и столами</h1>

      <select
        className="room-select"
        value={selectedRoomId ?? ""}
        onChange={(e) => setSelectedRoomId(Number(e.target.value))}
      >
        <option value="" disabled>
          Выберите комнату
        </option>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name}
          </option>
        ))}
      </select>

      <div className="table-grid">
        {tables.length === 0 && <p>Нет столов в этой комнате</p>}
        {tables.map((table) => (
          <div
            key={table.id}
            className={`table-card ${selectedTable?.id === table.id ? "selected" : ""}`}
            onClick={() => selectTable(table)}
          >
            <img src={getTableImageUrl(table)} alt={table.label} className="table-img" />
            <h3 className="table-label">{table.label}</h3>
          </div>
        ))}
      </div>

      <div className="management-section">
        <div className="table-info">
          {selectedTable ? (
            <>
              <h2>{selectedTable.label}</h2>
              <p>{selectedTable.description}</p>
              <p>Мест: {selectedTable.seats}</p>
              <div className="table-actions">
                <button onClick={() => deleteTable(selectedTable.id)} className="btn btn-danger">
                  Удалить стол
                </button>
                <button onClick={() => setEditModalOpen(true)} className="btn btn-edit">
                  Изменить
                </button>
              </div>
            </>
          ) : (
            <p>Выберите стол для редактирования</p>
          )}
        </div>

        <div className="room-actions">
          <button onClick={() => setAddTableModalOpen(true)} className="btn btn-primary">
            Добавить новый стол
          </button>
          <button onClick={() => setAddRoomModalOpen(true)} className="btn btn-primary">
            Добавить комнату
          </button>
          <button
            onClick={() => {
              if (selectedRoomId) setEditRoomModalOpen(true);
              else alert("Выберите комнату для редактирования");
            }}
            className="btn btn-secondary"
          >
            Изменить название комнаты
          </button>
          <button onClick={deleteRoom} className="btn btn-danger">
            Удалить комнату
          </button>
        </div>
      </div>

      {/* Модалка: Редактирование стола */}
      {isEditModalOpen && (
      <div className="modal-backdrop" onClick={() => setEditModalOpen(false)}>
        <div className="modal" onClick={(e) => e.stopPropagation()}>
          <h3>Редактировать стол</h3>
          <input
            type="text"
            placeholder="Название"
            className="modal-input"
            value={tableForm.label}
            onChange={(e) => setTableForm({ ...tableForm, label: e.target.value })}
          />
          <textarea
            placeholder="Описание"
            className="modal-textarea"
            value={tableForm.description}
            onChange={(e) => setTableForm({ ...tableForm, description: e.target.value })}
          />
          <input
            type="number"
            min={1}
            placeholder="Количество мест"
            className="modal-input"
            value={tableForm.seats}
            onChange={(e) => setTableForm({ ...tableForm, seats: Number(e.target.value) })}
          />
          <p>Текущая картинка:</p>
          <img
            src={getTableImageUrl(tableForm)}
            alt="preview"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setTableImageFile(e.target.files[0])}
          />
          <div className="modal-buttons">
            <button onClick={handleEditTable} className="btn btn-primary">
              Сохранить
            </button>
            <button onClick={() => setEditModalOpen(false)} className="btn btn-secondary">
              Отмена
            </button>
          </div>
        </div>
      </div>
    )}

      {/* Модалка: Добавить стол */}
      {isAddTableModalOpen && (
        <div className="modal-backdrop" onClick={() => setAddTableModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Добавить стол</h3>
            <input
              type="text"
              placeholder="Название"
              value={tableForm.label}
              onChange={(e) => setTableForm({ ...tableForm, label: e.target.value })}
            />
            <textarea
              placeholder="Описание"
              value={tableForm.description}
              onChange={(e) => setTableForm({ ...tableForm, description: e.target.value })}
            />
            <input
              type="number"
              min={1}
              placeholder="Количество мест"
              value={tableForm.seats}
              onChange={(e) => setTableForm({ ...tableForm, seats: Number(e.target.value) })}
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setTableImageFile(e.target.files[0])}
            />
            <div className="modal-buttons">
              <button onClick={handleAddTable} className="btn btn-primary">
                Добавить
              </button>
              <button onClick={() => setAddTableModalOpen(false)} className="btn btn-secondary">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка: Добавить комнату */}
      {isAddRoomModalOpen && (
        <div className="modal-backdrop" onClick={() => setAddRoomModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Добавить комнату</h3>
            <input
              type="text"
              placeholder="Название комнаты"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handleAddRoom} className="btn btn-primary">
                Добавить
              </button>
              <button onClick={() => setAddRoomModalOpen(false)} className="btn btn-secondary">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Модалка: Редактировать комнату */}
      {isEditRoomModalOpen && (
        <div className="modal-backdrop" onClick={() => setEditRoomModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Редактировать комнату</h3>
            <input
              type="text"
              placeholder="Название комнаты"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={handleEditRoom} className="btn btn-primary">
                Сохранить
              </button>
              <button onClick={() => setEditRoomModalOpen(false)} className="btn btn-secondary">
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
