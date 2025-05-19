
'use client';

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import AuthForm from './components/AuthForm';
import { fetchPokemonData, Pokemon } from './api/api';
import Scoreboard from './components/Scoreboard';
import CardGrid from './components/CardGrid';

const shuffle = <T,>(array: T[]): T[] => {
  return array
    .map((a) => ({ sort: Math.random(), value: a }))
    .sort((a, b) => a.sort - b.sort)
    .map((a) => a.value);
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [cards, setCards] = useState<Pokemon[]>([]);
  const [clickedIds, setClickedIds] = useState<Set<number>>(new Set());
  const [score, setScore] = useState<number>(0);
  const [bestScore, setBestScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('bestScore')) || 0;
    }
    return 0;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      async function loadData() {
        const data = await fetchPokemonData();
        setCards(shuffle(data));
      }
      loadData();
    }
  }, [user]);

  const handleCardClick = (id: number) => {
    if (clickedIds.has(id)) {
      setScore(0);
      setClickedIds(new Set());
    } else {
      const newClicked = new Set(clickedIds);
      newClicked.add(id);
      setClickedIds(newClicked);
      const newScore = score + 1;
      setScore(newScore);
      if (newScore > bestScore) {
        setBestScore(newScore);
        if (typeof window !== 'undefined') {
          localStorage.setItem('bestScore', newScore.toString());
        }
      }
    }
    setCards((prev) => shuffle(prev));
  };

  if (!user) {
    return <AuthForm />;
  }

  return (
    <main>
      <h1>Memory Card Game</h1>
      <Scoreboard score={score} bestScore={bestScore} />
      <CardGrid cards={cards} onCardClick={handleCardClick} />
    </main>
  );
}













