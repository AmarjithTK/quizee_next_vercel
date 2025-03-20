"use client";

import { useState } from 'react';

export default function QuizForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    category: '8',  // Any Category
    difficulty: 'easy',
    amount: 10
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Generate API URL
      let apiUrl;
      if (formData.category === '8') {
        apiUrl = `https://opentdb.com/api.php?amount=${formData.amount}&difficulty=${formData.difficulty}&type=multiple`;
      } else {
        apiUrl = `https://opentdb.com/api.php?amount=${formData.amount}&category=${formData.category}&difficulty=${formData.difficulty}&type=multiple`;
      }
      
      console.log('Generated API URL:', apiUrl);
      
      // Validate the API URL works before submitting
      const testResponse = await fetch(apiUrl);
      const testData = await testResponse.json();
      
      if (testData.response_code !== 0) {
        throw new Error(`API Error: ${getApiErrorMessage(testData.response_code)}`);
      }
      
      onSubmit({...formData, apiUrl});
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to start quiz: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Helper function to translate API error codes
  function getApiErrorMessage(code) {
    switch (code) {
      case 1: return "No results found. Try different options.";
      case 2: return "Invalid parameter. Check your selections.";
      case 3: return "Session token not found.";
      case 4: return "Session token expired.";
      default: return `Unknown error (${code})`;
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-2 font-medium text-gray-700">Category</label>
        <select 
          name="category" 
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          disabled={isSubmitting}
        >
          <option value="8">Any Category</option>
          <option value="9">General Knowledge</option>
          <option value="10">Entertainment: Books</option>
          <option value="11">Entertainment: Film</option>
          <option value="12">Entertainment: Music</option>
          <option value="17">Science & Nature</option>
          <option value="18">Science: Computers</option>
          <option value="19">Science: Mathematics</option>
          <option value="21">Sports</option>
          <option value="22">Geography</option>
          <option value="23">History</option>
        </select>
      </div>
      
      <div>
        <label className="block mb-2 font-medium text-gray-700">Difficulty</label>
        <select 
          name="difficulty" 
          value={formData.difficulty}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          disabled={isSubmitting}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>
      
      <div>
        <label className="block mb-2 font-medium text-gray-700">Number of Questions</label>
        <input 
          type="number" 
          name="amount" 
          value={formData.amount}
          onChange={handleChange}
          min="1" 
          max="50"
          className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
          disabled={isSubmitting}
        />
      </div>
      
      <button 
        type="submit"
        className={`w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors ${
          isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
        }`}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </span>
        ) : 'Start Quiz'}
      </button>
    </form>
  );
}