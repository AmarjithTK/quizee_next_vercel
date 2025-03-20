export default function ResultsList({ answers, onBackToScore, onPlayAgain }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Review Answers</h1>
        <div className="space-x-2">
          <button
            onClick={onBackToScore}
            className="bg-gray-200 text-gray-800 py-1 px-3 rounded hover:bg-gray-300 transition-colors text-sm"
          >
            Back
          </button>
          <button
            onClick={onPlayAgain}
            className="bg-blue-600 text-white py-1 px-3 rounded hover:bg-blue-700 transition-colors text-sm"
          >
            New Quiz
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {answers.map((item, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border ${
              item.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
            }`}
          >
            <p className="text-sm text-gray-500">Question {index + 1}</p>
            <p 
              className="font-medium mb-2"
              dangerouslySetInnerHTML={{ __html: item.question }}
            />
            
            {!item.isCorrect && (
              <p className="text-red-700 mb-1">
                Your answer: <span dangerouslySetInnerHTML={{ __html: item.selected_answer }}/>
              </p>
            )}
            
            <p className={item.isCorrect ? "text-green-700" : "text-green-700"}>
              Correct answer: <span dangerouslySetInnerHTML={{ __html: item.correct_answer }}/>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}