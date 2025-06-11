import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../styles/Header.scss';
import  proffileimg from'../images/profile.svg'
import { isLoggedIn, logout } from '../utilis/auth';

export default function Header({ toggleProfile }) {
  const location = useLocation();
  const loggedIn = isLoggedIn();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
  <header className="header">
    <div className="header-left">
      <button className="icon-btn" onClick={toggleProfile}>
        <img alt="Профиль" className="icon-img" src={proffileimg} />
      </button>
    </div>

    <div className="header-center">
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Меню</Link>
    </div>

    <div className="header-right">
      <Link to="/info" className={location.pathname === '/info' ? 'active' : ''}>Инфо</Link>
      {loggedIn && (
          <button className="logout-btn" onClick={handleLogout}>Выход</button>
        )}
    </div>
  </header>

  );
}