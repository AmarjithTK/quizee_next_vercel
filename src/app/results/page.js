"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ScoreCard from '@/components/ScoreCard';
import ResultsList from '@/components/ResultsList';

export default function Results() {
  const router = useRouter();
  const [results, setResults] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  
  useEffect(() => {
    // Get results from localStorage
    const savedResults = localStorage.getItem('quizResults');
    
    if (!savedResults) {
      router.replace('/');
      return;
    }
    
    setResults(JSON.parse(savedResults));
  }, [router]);
  
  if (!results) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {!showAnswers ? (
        <ScoreCard 
          score={results.score}
          totalQuestions={results.totalQuestions}
          onViewAnswers={() => setShowAnswers(true)}
          onPlayAgain={() => router.push('/')}
        />
      ) : (
        <ResultsList 
          answers={results.answers}
          onBackToScore={() => setShowAnswers(false)}
          onPlayAgain={() => router.push('/')}
        />
      )}
    </div>
  );
}