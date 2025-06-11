  import { useNavigate } from 'react-router-dom';
  import { isLoggedIn, getUserRole, getToken } from '../utilis/auth';
  import React, { useState, useEffect } from 'react';
  import '../styles/BookingModal.scss';

  export default function BookingModal({ isOpen, onClose }) {
    const [tables, setTables] = useState([]);
    const [availableTimes, setAvailableTimes] = useState([]);
    const [timeIndex, setTimeIndex] = useState(0);
    const navigate = useNavigate();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedTable, setSelectedTable] = useState(null);
    const [confirmationStep, setConfirmationStep] = useState(1);
    const [verificationCode, setVerificationCode] = useState('');
    const [emailCodeInput, setEmailCodeInput] = useState('');
    const [isSendingCode, setIsSendingCode] = useState(false);

    const selected = availableTimes[timeIndex];

    // Получение столов
    useEffect(() => {
      if (!selected) return;

      async function fetchTables() {
        try {
          const datetime = `${selectedDate.toISOString().slice(0, 10)}T${selected}`;
          const response = await fetch(`/api/guest/tables?datetime=${encodeURIComponent(datetime)}`);
          const data = await response.json();
          setTables(data);
        } catch (err) {
          console.error('Ошибка при загрузке столов:', err);
        }
      }

      fetchTables();
    }, [selected,selectedDate]);

    // Генерация времени
    useEffect(() => {
      const slots = [];
      const base = new Date(selectedDate);

      if (
        selectedDate.toDateString() === new Date().toDateString()
      ) {
        base.setHours(new Date().getHours(), new Date().getMinutes(), 0, 0);
        const remainder = base.getMinutes() % 15;
        if (remainder !== 0) base.setMinutes(base.getMinutes() + (15 - remainder));
      } else {
        base.setHours(12, 0, 0, 0); // или 10:00 – ваше стандартное начало
      }

      const end = new Date(selectedDate);
      end.setHours(22, 0, 0, 0);
      console.log('Start:', base, 'End:', end);
      if (base >= end) {
          base.setHours(21, 45, 0, 0);
        }
      while (base <= end) {
        slots.push(base.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        base.setMinutes(base.getMinutes() + 15);
      }

      setAvailableTimes(slots);
      setTimeIndex(0);
    }, [selectedDate, isOpen]);

    const formatLocalDateTime = (date) => {

      const pad = (n) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
    };
    const handleSendCode = async () => {
    if (!selectedTable) {
      alert('Пожалуйста, выберите столик');
      return;
    }

    setIsSendingCode(true);
      try {
        const start = new Date(selectedDate);
        const [hours, minutes] = selected.split(':');
        start.setHours(+hours, +minutes, 0, 0);

        const end = new Date(start);
        end.setMinutes(end.getMinutes() + 60);

        const res = await fetch('/api/user/reservations/send-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            tableid: selectedTable.id,
            startTime: formatLocalDateTime(start),
            endTime: formatLocalDateTime(end),
          }),
        });

        if (res.ok) {
          alert('Код подтверждения отправлен на вашу почту.');
          setConfirmationStep(2);
        } else {
          const text = await res.text();
          alert('Ошибка при отправке кода: ' + text);
        }
      } catch (error) {
        console.error(error);
        alert('Ошибка при отправке кода подтверждения');
      }
      setIsSendingCode(false);
    };

    // Подтверждение бронирования кодом (шаг 2)
    const handleConfirmReservation = async () => {
      if (!emailCodeInput) {
        alert('Пожалуйста, введите код подтверждения');
        return;
      }

      try {
        const start = new Date(selectedDate);
        const [hours, minutes] = selected.split(':');
        start.setHours(+hours, +minutes, 0, 0);

        const end = new Date(start);
        end.setMinutes(end.getMinutes() + 60);

        const res = await fetch('/api/user/reservations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            tableid: selectedTable.id,
            startTime: formatLocalDateTime(start),
            endTime: formatLocalDateTime(end),
            code: emailCodeInput,
          }),
        });

        if (res.ok) {
          alert('Бронирование подтверждено!');
          setConfirmationStep(1);
          setEmailCodeInput('');
          onClose();
        } else {
          const text = await res.text();
          alert('Ошибка подтверждения брони: ' + text);
        }
      } catch (error) {
        console.error(error);
        alert('Ошибка при подтверждении брони');
      }
    };

    if (!isOpen ) return null;

    const visibleTables = tables.filter((t) => t.available);

    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="booking-modal" onClick={(e) => e.stopPropagation()}>
          <h2>Бронирование</h2>

          {confirmationStep === 1 && (
            <>
              <div className="date-picker">
                <label>Дата:</label>
                <input
                  type="date"
                  value={selectedDate.toISOString().slice(0, 10)}
                  onChange={(e) => setSelectedDate(new Date(e.target.value))}
                />
              </div>
              <div className="time-switcher">
                <button onClick={() => setTimeIndex((prev) => (prev - 1 + availableTimes.length) % availableTimes.length)}>◀</button>
                <span>{selected}</span>
                <button onClick={() => setTimeIndex((prev) => (prev + 1) % availableTimes.length)}>▶</button>
              </div>

              <div className="table-grid">
                {visibleTables.length === 0 ? (
                  <p className="no-tables-message">Нет доступных столов на выбранное время.</p>
                ) : (
                  visibleTables.map((table) => (
                    <div
                      className={`table-card ${selectedTable?.id === table.id ? 'selected' : ''}`}
                      key={table.id}
                      onClick={() => setSelectedTable(table)}
                      style={{ cursor: 'pointer' }}
                    >
                      <img src={`http://localhost:8080${table.stringUrl}`} alt={`Столик ${table.label}`} />
                      <div className="caption">
                        <strong>{table.label}</strong><br />
                        {table.seats} человек
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button onClick={handleSendCode} disabled={isSendingCode || !selectedTable}>
                {isSendingCode ? 'Отправка...' : 'Забронировать и получить код'}
              </button>
            </>
          )}

          {confirmationStep === 2 && (
            <>
              <p>Введите код подтверждения, отправленный на вашу почту:</p>
              <input
                type="text"
                value={emailCodeInput}
                onChange={(e) => setEmailCodeInput(e.target.value)}
                maxLength={4}
                placeholder="Код из письма"
              />
              <div style={{ marginTop: 10 }}>
                <button onClick={handleConfirmReservation}>Подтвердить бронь</button>
                <button onClick={() => { setConfirmationStep(1); setEmailCodeInput(''); }}>
                  Назад
                </button>
              </div>
            </>
          )}
        </div>
      </div>
  );
}