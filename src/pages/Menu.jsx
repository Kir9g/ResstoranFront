import CategoryScroller from '../components/CategoryScroller';
import { useState, useEffect } from 'react';
import '../styles/Menu.scss';
import { useNavigate } from 'react-router-dom';


export default function Menu() {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then((data) => {
        // Формируем категории с картинками
        const formatted = data.map(category => ({
          title: category.name,
          slug: category.slug || category.name.toUpperCase(),
          image: `http://localhost:8080${category.imageUrl}`
        }));
        setCategories(formatted);
      })
      .catch((err) => {
        console.error('Ошибка при загрузке категорий:', err);
      });
  }, []);

  const handleMore = (item) => {
    navigate(`/category/${item.slug}`);
  };

  return (
    <main className="menu-page">
      <h2>Меню</h2>
      <CategoryScroller categories={categories} onMore={handleMore} />
    </main>
  );
}
