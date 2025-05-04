import React from 'react';
import Card from './Card';
import { Pokemon } from '../api/api';

interface CardGridProps {
  cards: Pokemon[];
  onCardClick: (id: number) => void;
}

const CardGrid: React.FC<CardGridProps> = ({ cards, onCardClick }) => {
  return (
    <div className="card-grid">
      {cards.map((card) => (
        <Card key={card.id} id={card.id} name={card.name} image={card.image} onClick={() => onCardClick(card.id)} />
      ))}
    </div>
  );
};

export default CardGrid;
