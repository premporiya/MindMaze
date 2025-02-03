import React, { useState, useEffect } from "react";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(10);
  const [timerActive, setTimerActive] = useState(false);
  const [startGame, setStartGame] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userDetails, setUserDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch(
          "https://opentdb.com/api.php?amount=5&type=multiple"
        );
        const data = await response.json();
        const formattedQuestions = data.results.map((item) => ({
          question: item.question,
          options: shuffleOptions([...item.incorrect_answers, item.correct_answer]),
          answer: item.correct_answer,
        }));
        setQuestions(formattedQuestions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching quiz questions:", error);
        setLoading(false);
      }
    };
    fetchQuestions();
  }, []);

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
        setTimer(10);
        setTimerActive(true);
      } else {
        setShowScore(true);
        setTimerActive(false);
      }
    }, 1000);
  };

  useEffect(() => {
    let timerInterval;
    if (startGame && timerActive && timer > 0) {
      timerInterval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else if (timer === 0) {
      setTimerActive(false);
      setTimeout(() => {
        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < questions.length) {
          setCurrentQuestion(nextQuestion);
          setTimer(10);
          setSelectedOption(null);
          setTimerActive(true);
        } else {
          setShowScore(true);
          setTimerActive(false);
        }
      }, 1000);
    }
    return () => clearInterval(timerInterval);
  }, [startGame, timerActive, timer, currentQuestion, questions.length]);

  const handleLogin = (e) => {
    e.preventDefault();
    const nameRegex = /^[a-zA-Z]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!userDetails.firstName || !userDetails.lastName || !userDetails.email) {
      alert("Please fill out all fields.");
      return;
    }
    if (!nameRegex.test(userDetails.firstName) || !nameRegex.test(userDetails.lastName)) {
      alert("Name must contain only letters.");
      return;
    }
    if (!emailRegex.test(userDetails.email)) {
      alert("Invalid email format.");
      return;
    }
    
    setIsLoggedIn(true);
  };

  const handleStartGame = () => {
    setStartGame(true);
    setTimerActive(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="login-container">
        <h1>Enter Your Details</h1>
        <form onSubmit={handleLogin}>
          <label>
            First Name:
            <input
              type="text"
              value={userDetails.firstName}
              onChange={(e) => setUserDetails({ ...userDetails, firstName: e.target.value })}
              required
            />
          </label>
          <label>
            Last Name:
            <input
              type="text"
              value={userDetails.lastName}
              onChange={(e) => setUserDetails({ ...userDetails, lastName: e.target.value })}
              required
            />
          </label>
          <label>
            Email:
            <input
              type="email"
              value={userDetails.email}
              onChange={(e) => setUserDetails({ ...userDetails, email: e.target.value })}
              required
            />
          </label>
          <button type="submit">Sign In</button>
        </form>
      </div>
    );
  }

  if (!startGame) {
    return (
      <div className="start-game-container">
        <h1>Welcome {userDetails.firstName}!</h1>
        <button onClick={handleStartGame}>Start Game</button>
      </div>
    );
  }

  if (loading) {
    return <div>Loading questions...</div>;
  }

  return (
    <div className="quiz">
      <h1>MindMaze</h1>
      {!showScore && (
        <div className="timer-section">
          <span role="img" aria-label="clock"> 🕒 </span>
          <span>{timer} seconds</span>
        </div>
      )}
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
                      ? "correct"
                      : "incorrect"
                    : ""
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
