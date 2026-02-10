// test-eslint.tsx
// File untuk menguji konfigurasi ESLint

import React, { useState, useEffect } from 'react';

// Tes aturan react/function-component-definition
const TestComponent: React.FC<{ title: string }> = ({ title }) => {
  const [count, setCount] = useState<number>(0);

  // Tes aturan react-hooks/rules-of-hooks
  useEffect(() => {
    document.title = `Count: ${count}`;
  }, [count]);

  // Tes aturan jsx-a11y
  return (
    <div>
      <h1>{title}</h1>
      <button
        type="button"
        onClick={() => setCount(count + 1)}
      >
        Count: {count}
      </button>
    </div>
  );
};

// Tes aturan prefer-template
const greeting = `Hello, ${'world'}`;

// Tes aturan no-unused-vars (harusnya muncul warning)
const unusedVariable = 'This variable is not used';

export default TestComponent;