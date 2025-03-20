"use client";

import { useState, useEffect } from 'react';
import { decodeHTML, shuffle } from '@/lib/utils';

export default function QuizQuestion({ question, correctAnswer, incorrectAnswers, onSelectAnswer }) {
  const [allAnswers, setAllAnswers] = useState([]);
  const [answered, setAnswered] = useState(false);
  
  useEffect(() => {
    // Reset state when question changes
    setAnswered(false);
    
    // Create shuffled answers array
    const answers = [...incorrectAnswers, correctAnswer];
    setAllAnswers(shuffle(answers));
  }, [question, incorrectAnswers, correctAnswer]);
  
  const handleSelectAnswer = (answer) => {
    if (answered) return;
    
    setAnswered(true);
    
    // Delay to show the selection before moving to next question
    setTimeout(() => {
      onSelectAnswer(answer);
    }, 750);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 
        className="text-xl font-semibold mb-6" 
        dangerouslySetInnerHTML={{ __html: question }}
      />
      
      <div className="space-y-3">
        {allAnswers.map((answer, index) => (
          <button
            key={index}
            onClick={() => handleSelectAnswer(answer)}
            disabled={answered}
            className={`w-full text-left p-3 rounded border ${
              answered && answer === correctAnswer
                ? 'bg-green-100 border-green-500'
                : answered && answer !== correctAnswer
                ? 'bg-red-100 border-red-500'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
            dangerouslySetInnerHTML={{ __html: answer }}
          />
        ))}
      </div>
    </div>
  );
}