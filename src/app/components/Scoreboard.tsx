import React from 'react';

interface ScoreboardProps {
  score: number;
  bestScore: number;
}

const Scoreboard: React.FC<ScoreboardProps> = ({ score, bestScore }) => {
  return (
    <div className="scoreboard">
      <div>Score: {score}</div>
      <div>Best Score: {bestScore}</div>
    </div>
  );
};

export default Scoreboard;
