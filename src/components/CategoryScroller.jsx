import { useState } from 'react';
import '../styles/CategoryScroller.scss';

export default function CategoryScroller({ categories, onMore }) {
  const [activeIndex, setActiveIndex] = useState(1); // центральная карточка

  const rotateLeft = () => {
    setActiveIndex((prev) =>
      (prev - 1 + categories.length) % categories.length
    );
  };

  const rotateRight = () => {
    setActiveIndex((prev) =>
      (prev + 1) % categories.length
    );
  };

  const getVisibleCards = () => {
    if (categories.length < 3) return categories;
    const left = (activeIndex - 1 + categories.length) % categories.length;
    const right = (activeIndex + 1) % categories.length;
    return [categories[left], categories[activeIndex], categories[right]];
  };

  const visibleCards = getVisibleCards();

  return (
    <div className="scroller-container">
      <button className="scroll-btn left" onClick={rotateLeft}>❮</button>

      <div className="scroller">
        {visibleCards.map((item, idx) => (
          <div
            className={`card ${idx === 1 ? 'active' : ''}`}
            key={item.title}
          >
            <img src={item.image} alt={item.title} />
            <div className="title">{item.title}</div>
            {idx === 1 && (
              <button className="more-btn" onClick={() => onMore(item)}>
                Подробнее
              </button>
            )}
          </div>
        ))}
      </div>

      <button className="scroll-btn right" onClick={rotateRight}>❯</button>
    </div>
  );
}
