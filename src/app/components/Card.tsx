import React from 'react';

interface CardProps {
  id: number;
  name: string;
  image: string;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ id, name, image, onClick }) => {
  return (
    <div
      className="card"
      data-id={id}  // <-- Add this line to use id
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <img src={image} alt={name} />
      <p>{name}</p>
    </div>
  );
};

export default Card;
