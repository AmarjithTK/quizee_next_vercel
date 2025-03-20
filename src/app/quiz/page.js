"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import QuizQuestion from '@/components/QuizQuestion';

// Fallback questions if API fails
const FALLBACK_QUESTIONS = [
  {
    category: "Science: Computers",
    question: "What does CPU stand for?",
    correct_answer: "Central Processing Unit",
    incorrect_answers: ["Central Process Unit", "Computer Personal Unit", "Central Processor Unit"]
  },
  {
    category: "Science: Computers",
    question: "What does RAM stand for?",
    correct_answer: "Random Access Memory",
    incorrect_answers: ["Read Access Memory", "Random Access Module", "Real Application Memory"]
  },
  {
    category: "Science: Computers",
    question: "In computing, what does MIDI stand for?",
    correct_answer: "Musical Instrument Digital Interface",
    incorrect_answers: ["Musical Interface of Digital Instruments", "Modular Interface of Digital Instruments", "Musical Instrument Data Interface"]
  },
  {
    category: "Science: Computers",
    question: "What does the 'MP' stand for in MP3?",
    correct_answer: "Moving Picture",
    incorrect_answers: ["Music Player", "Multi Pass", "Micro Point"]
  },
  {
    category: "Entertainment: Video Games",
    question: "What was the first video game console to use CDs?",
    correct_answer: "TurboGrafx-CD",
    incorrect_answers: ["Sega CD", "PlayStation", "3DO"]
  }
];

// Simple shuffle function remains unchanged
function shuffle(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Novel: fetch with exponential backoff on 429 errors
async function fetchWithBackoff(url, options, maxRetries = 3) {
  let attempt = 0;
  let delay = 5000; // start at 5 seconds per API spec

  while (attempt < maxRetries) {
    const response = await fetch(url, options);
    if (response.status !== 429) {
      return response;
    }
    console.warn(`Rate limited, retrying in ${delay/1000} seconds... (Attempt ${attempt + 1} of ${maxRetries})`);
    await new Promise(resolve => setTimeout(resolve, delay));
    attempt++;
    delay *= 2;
  }
  // Final attempt without further retries
  return fetch(url, options);
}

export default function QuizPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [apiError, setApiError] = useState('');
  
  useEffect(() => {
    async function loadQuestions() {
      try {
        // Try to read quiz config (which may have been set via the Quiz Form)
        let configStr = localStorage.getItem('quizConfig');
        let apiUrl;
        if (configStr) {
          const config = JSON.parse(configStr);
          apiUrl = config.apiUrl;
        } else {
          // Default to the new endpoint if no config exists.
          apiUrl = "https://opentdb.com/api.php?amount=10&type=multiple&encode=url3986";
        }
        // Append a timestamp to avoid caching.
        apiUrl += `${apiUrl.includes('?') ? '&' : '?'}_t=${Date.now()}`;
        console.log("Fetching from API:", apiUrl);
        
        // Use exponential backoff fetch
        const response = await fetchWithBackoff(apiUrl, { 
          cache: 'no-store',
          headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
          }
        });
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        const data = await response.json();
        console.log("API Response:", data);
        if (data.response_code === 0 && data.results && data.results.length > 0) {
          setQuestions(data.results);
          setIsUsingFallback(false);
          setApiError('');
        } else {
          throw new Error(`Invalid API response: ${data.response_code}`);
        }
      } catch (error) {
        console.error('Failed to load questions:', error);
        setQuestions(FALLBACK_QUESTIONS);
        setIsUsingFallback(true);
        setApiError(error.message);
      } finally {
        setLoading(false);
      }
    }
    
    loadQuestions();
  }, [router]);
  
  function handleRetry() {
    setLoading(true);
    setCurrentQuestion(0);
    setScore(0);
    setAnswers([]);
    setApiError('');
    setTimeout(() => {
      const savedConfig = localStorage.getItem('quizConfig');
      localStorage.setItem('quizConfig', savedConfig);
      setQuestions([]);
    }, 1000);
  }
  
  function handleAnswer(selectedAnswer) {
    if (!questions.length) return;
    const current = questions[currentQuestion];
    const isCorrect = selectedAnswer === current.correct_answer;
    if (isCorrect) {
      setScore(score + 1);
    }
    const newAnswer = {
      question: current.question,
      correct_answer: current.correct_answer,
      selected_answer: selectedAnswer,
      isCorrect
    };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      localStorage.setItem('quizResults', JSON.stringify({
        score: score + (isCorrect ? 1 : 0),
        totalQuestions: questions.length,
        answers: updatedAnswers,
        usingFallback: isUsingFallback
      }));
      router.push('/results');
    }
  }
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }
  
  if (!questions.length) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center py-16 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-red-500 mb-4">No questions available</h2>
          {apiError && <p className="text-sm text-gray-600 mb-4">Error: {apiError}</p>}
          <button onClick={() => router.push('/')} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Back to Home
          </button>
        </div>
      </div>
    );
  }
  
  const questionData = questions[currentQuestion];
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {isUsingFallback && (
        <div className="mb-4 p-2 bg-yellow-100 border border-yellow-300 rounded text-yellow-800">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm">Using sample questions (API unavailable)</p>
              {apiError && <p className="text-xs mt-1 text-red-600">{apiError}</p>}
            </div>
            <button onClick={handleRetry} className="bg-blue-600 text-white text-xs px-2 py-1 rounded hover:bg-blue-700">
              Retry
            </button>
          </div>
        </div>
      )}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">
            Question {currentQuestion + 1} of {questions.length}
          </span>
          <span className="text-sm font-medium">Score: {score}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
               style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}>
          </div>
        </div>
      </div>
      <QuizQuestion 
        question={questionData.question}
        correctAnswer={questionData.correct_answer}
        incorrectAnswers={questionData.incorrect_answers}
        onSelectAnswer={handleAnswer}
      />
    </div>
  );
}