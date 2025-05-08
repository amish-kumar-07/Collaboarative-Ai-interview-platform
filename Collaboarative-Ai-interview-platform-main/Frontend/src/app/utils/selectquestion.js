export const questions = [
    { id: 1, title: "Sum of Two Numbers", description: "Write a function that returns the sum of two numbers.", input: "3 5", output: "8" },
    { id: 2, title: "Reverse a String", description: "Write a function that reverses a given string.", input: "hello", output: "olleh" },
    { id: 3, title: "Find Maximum Number", description: "Write a function that returns the maximum of three numbers.", input: "7 2 9", output: "9" },
    { id: 4, title: "Check Palindrome", description: "Write a function that checks if a string is a palindrome.", input: "madam", output: "Yes" },
    { id: 5, title: "Factorial Calculation", description: "Write a function that returns the factorial of a given number.", input: "5", output: "120" },
    { id: 6, title: "Count Vowels", description: "Write a function that counts the number of vowels in a given string.", input: "Perplexity", output: "3" },
  ];
  
  export const selectRandomQuestion = () => {
    const index = Math.floor(Math.random() * questions.length);
    return questions[index];
  };
  