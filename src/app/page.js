"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import QuizForm from '@/components/QuizForm';

export default function Home() {
  const router = useRouter();
  
  const handleStartQuiz = (quizConfig) => {
    localStorage.setItem('quizConfig', JSON.stringify(quizConfig));
    router.push('/quiz');
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
          Quizzee <span className="bg-blue-600 text-white text-xl px-2 py-0.5 rounded">Trivia</span>
        </h1>
        <h2 className="mt-4 text-xl font-semibold text-gray-700">Choose your Preferences</h2>
      </header>
      
      <main className="bg-white rounded-lg shadow-lg p-6">
        <QuizForm onSubmit={handleStartQuiz} />
      </main>
    </div>
  );
}