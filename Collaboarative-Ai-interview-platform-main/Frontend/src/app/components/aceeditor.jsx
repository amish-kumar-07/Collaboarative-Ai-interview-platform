'use client';

import Ace from 'react-ace';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-python';
import { useState, useEffect } from 'react';

export const AceEditor = () => {
  const [code, setCode] = useState('');
  const [lang, setLang] = useState('python');

  // Ensure the code only runs in the browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCode = sessionStorage.getItem('editor-code');
      const savedLang = sessionStorage.getItem('editor-lang');

      if (savedCode) setCode(savedCode);
      if (savedLang) setLang(savedLang);
    }
  }, []);

  // Update sessionStorage when code or lang changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('editor-code', code);
      sessionStorage.setItem('editor-lang', lang);
    }
  }, [code, lang]);

  const handleLang = (value) => {
    if (value !== lang) {
      setLang(value);
    }
  };

  return (
    <div className="relative w-full h-[400px]">
      <div className="absolute top-2 right-2 z-10">
        <select
          onChange={(e) => handleLang(e.target.value)}
          value={lang}
          className="bg-green-500 hover:bg-green-600 rounded-md text-white p-1 focus:outline-none"
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>
      </div>

      <Ace
        value={code}
        onChange={setCode}
        mode={lang}
        theme="monokai"
        name="code-editor"
        width="100%"
        height="100%"
        setOptions={{
          showLineNumbers: true,
          tabSize: 2,
        }}
      />
    </div>
  );
};
