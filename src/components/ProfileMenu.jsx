import '../styles/ProfileMenu.scss';
import { FaUser, FaShoppingBasket, FaHistory, FaCalendarCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn } from '../utilis/auth';

export default function ProfileMenu({ isOpen, onClose, onBookClick}) {
  if (!isOpen) return null;
  const loggedIn = isLoggedIn();
  const navigate = useNavigate(); 
  return (
    <div className="profile-overlay" onClick={onClose}>
      <div className="profile-menu" onClick={(e) => e.stopPropagation()}>
        <ul>
          {loggedIn ? (
            <>
              <li onClick={() => { onClose(); navigate('/profile'); }}>
                <FaUser className="icon" /><span>Профиль</span>
              </li>
              <li onClick={() => { onClose(); navigate('/cart'); }}>
                <FaShoppingBasket className="icon" /><span>Корзина</span>
              </li>
              <li onClick={() => { onClose(); navigate('/reservation-history'); }}>
                <FaHistory className="icon" /><span>История</span>
              </li>

            </>
          ) : (
            <li onClick={() => { onClose(); navigate('/login'); }}>
              <FaUser className="icon" /><span>Авторизация</span>
            </li>
          )}

          <li onClick={onBookClick}>
            <FaCalendarCheck className="icon" /><span>Бронирование</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
