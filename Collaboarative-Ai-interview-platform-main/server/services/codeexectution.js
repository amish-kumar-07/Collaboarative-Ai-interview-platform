// executionhandler.js
const axios = require("axios");

const questions = [
  { id: 1, title: "Sum of Two Numbers", description: "Write a function that returns the sum of two numbers.", input: "3 5", output: "8" },
  { id: 2, title: "Reverse a String", description: "Write a function that reverses a given string.", input: "hello", output: "olleh" },
  { id: 3, title: "Find Maximum Number", description: "Write a function that returns the maximum of three numbers.", input: "7 2 9", output: "9" },
  { id: 4, title: "Check Palindrome", description: "Write a function that checks if a string is a palindrome.", input: "madam", output: "Yes" },
  { id: 5, title: "Factorial Calculation", description: "Write a function that returns the factorial of a given number.", input: "5", output: "120" },
  { id: 6, title: "Count Vowels", description: "Write a function that counts the number of vowels in a given string.", input: "Perplexity", output: "3" },
];

const codexecution = async (code, language_id, questionid) => {
  const question = questions.find((q) => q.id === parseInt(questionid));

  if (!question) {
    throw new Error("Question not found");
  }

  const payload = {
    source_code: code,
    language_id: language_id,
    stdin: question.input,
    expected_output: question.output,
  };

  try {
    const response = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          "X-RapidAPI-Key": "a735b7febamsh1c15929d46ea261p1d0159jsn543e1d05f9f4", // Replace with your API key
        },
      }
    );
    return response.data.token;
  } catch (error) {
    console.error("Error while executing code:", error);
    throw new Error("Execution failed");
  }
};

const checkStatus = async (token) => {
  try {
    const response = await axios.get(
      `https://judge0-ce.p.rapidapi.com/submissions/${token}`,
      {
        headers: {
          "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
          "X-RapidAPI-Key": "a735b7febamsh1c15929d46ea261p1d0159jsn543e1d05f9f4", // Replace with your API key
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error while checking status:", error);
    throw new Error("Failed to check status");
  }
};

module.exports = { codexecution, checkStatus };