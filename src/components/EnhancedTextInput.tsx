import React, { useRef, useEffect } from 'react';
import { TextInput } from 'react-native';

// Enhanced TextInput component with long-press backspace
const EnhancedTextInput = ({ value, onChangeText, ...props }: any) => {
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousValueRef = useRef<string>(value);
  const backspaceCountRef = useRef<number>(0); // Track consecutive backspaces
  const lastBackspaceTimeRef = useRef<number>(0); // Track time of last backspace

  const handleTextChange = (text: string) => {
    const currentTime = Date.now();
    const previousValue = previousValueRef.current;

    // Update the previous value
    previousValueRef.current = text;

    // Check if user is backspacing
    if (text.length < previousValue.length && previousValue.length > 0) {
      const timeSinceLastBackspace = currentTime - lastBackspaceTimeRef.current;

      // If backspace is within 300ms, consider it a long press sequence
      if (timeSinceLastBackspace < 300) {
        backspaceCountRef.current += 1;

        // If 3 or more consecutive backspaces within 300ms, trigger clear
        if (backspaceCountRef.current >= 3) {
          if (longPressTimeoutRef.current) {
            clearTimeout(longPressTimeoutRef.current);
          }
          onChangeText(''); // Clear the entire input
          backspaceCountRef.current = 0; // Reset counter
          lastBackspaceTimeRef.current = 0; // Reset time
          return;
        }
      } else {
        // Reset if too much time has passed
        backspaceCountRef.current = 1;
      }

      // Set the last backspace time
      lastBackspaceTimeRef.current = currentTime;

      // Clear any existing timeout if not part of a long press
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    } else {
      // Reset on typing
      backspaceCountRef.current = 0;
      lastBackspaceTimeRef.current = 0;
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    }

    onChangeText(text);
  };

  // Update ref when value changes from parent
  useEffect(() => {
    previousValueRef.current = value;
  }, [value]);

  // Clean up timeout on component unmount
  useEffect(() => {
    return () => {
      if (longPressTimeoutRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);

  return (
    <TextInput
      value={value}
      onChangeText={handleTextChange}
      {...props}
    />
  );
};

export default EnhancedTextInput;