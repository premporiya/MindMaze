import React, { useState, useEffect } from 'react';

const Quiz = () => {
  const [questions, setQuestions] = useState([]); // Questions fetched from API
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true); // Loading state

  // Fetch questions from an API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Replace this URL with the API or public link providing questions
        const response = await fetch('https://opentdb.com/api.php?amount=5&type=multiple');
        const data = await response.json();

        // Transform the data into the desired format
        const formattedQuestions = data.results.map((item) => ({
          question: item.question,
          options: shuffleOptions([...item.incorrect_answers, item.correct_answer]),
          answer: item.correct_answer,
        }));

        setQuestions(formattedQuestions);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching quiz questions:', error);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Shuffle options for randomness
  const shuffleOptions = (options) => options.sort(() => Math.random() - 0.5);

  const handleAnswer = (option) => {
    setSelectedOption(option);
    if (option === questions[currentQuestion].answer) {
      setScore(score + 1);
    }
    setTimeout(() => {
      const nextQuestion = currentQuestion + 1;
      if (nextQuestion < questions.length) {
        setCurrentQuestion(nextQuestion);
        setSelectedOption(null);
      } else {
        setShowScore(true);
      }
    }, 1000);
  };

  if (loading) {
    return <div>Loading questions...</div>;
  }

  return (
    <div className="quiz">
      <h1>Quiz App</h1>
      {showScore ? (
        <div className="score-section">
          <h2>Your Score: {score} / {questions.length}</h2>
        </div>
      ) : (
        <div className="question-section">
          <h3>Question {currentQuestion + 1} / {questions.length}</h3>
          <p dangerouslySetInnerHTML={{ __html: questions[currentQuestion].question }}></p>
          <div className="options-section">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${
                  selectedOption === option
                    ? option === questions[currentQuestion].answer
                      ? 'correct'
                      : 'incorrect'
                    : ''
                }`}
                onClick={() => handleAnswer(option)}
                disabled={selectedOption !== null}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Quiz;
