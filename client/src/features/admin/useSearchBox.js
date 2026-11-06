import { useEffect, useRef, useState } from 'react';

// The search box keeps what you type at once; the address (and the request) update 350 ms after you stop typing,
// so a request is not sent for every single letter.
export function useSearchBox(search, setSearch, delay = 350) {
  const [text, setText] = useState(search);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const onChange = (event) => {
    const value = event.target.value;
    setText(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setSearch(value.trim()), delay);
  };

  return { text, setText, onChange };
}
