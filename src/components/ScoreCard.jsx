export default function ScoreCard({ score, totalQuestions, onViewAnswers, onPlayAgain }) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 text-center">
      <h1 className="text-2xl font-bold mb-2">Quiz Results</h1>
      <h2 className="text-4xl font-bold text-blue-600 mb-6">
        {score} / {totalQuestions}
      </h2>
      
      <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
        <button
          onClick={onViewAnswers}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
        >
          View Answers
        </button>
        <button
          onClick={onPlayAgain}
          className="bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition-colors"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}