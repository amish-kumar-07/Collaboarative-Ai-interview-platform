"use client";

export const handlerun = async (ques_id) => {
  console.log("▶️ Run button clicked");

  const code = sessionStorage.getItem('editor-code');
  const lang = sessionStorage.getItem('editor-lang');

  console.log("Retrieved from sessionStorage:", { code, lang });

  if (!code || !lang) {
    console.log("❌ Error: Code or language is missing in sessionStorage");
    return { error: 'Code or language is missing in sessionStorage' };
  }

  let language_id = 71; // Default to Python 3

  if (lang === 'python') {
    language_id = 71;
  } else if (lang === 'javascript') {
    language_id = 63;
  }

  if (!language_id) {
    console.log("❌ Error: Unsupported language");
    return { error: 'Unsupported language' };
  }

  const requestData = {
    code,
    language_id: parseInt(language_id),
    questionid: parseInt(ques_id),
  };

  console.log("📦 Request data prepared:", requestData);

  try {
    const res = await fetch('http://localhost:3001/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestData),
    });

    if (!res.ok) {
      throw new Error("Failed to connect to backend");
    }

    const data = await res.json();
    console.log("✅ Backend response received:", data);
    return data;
  } catch (error) {
    console.log("❌ Error in handlerun function:", error);
    return { error: 'Failed to reach the backend' };
  }
};
