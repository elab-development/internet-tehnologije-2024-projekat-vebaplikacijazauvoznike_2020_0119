import { useState, useEffect } from 'react';

// This custom hook delays updating a value until a certain amount of time has passed without it changing.
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up a timer to update the debounced value after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay has passed.
    // This is the key to debouncing.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // This effect re-runs only if the value or delay changes

  return debouncedValue;
}
