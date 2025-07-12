import React, { useRef, useEffect } from 'react';
import { TextInput } from 'react-native';

// Enhanced TextInput component with long-press backspace
const EnhancedTextInput = ({ value, onChangeText, ...props }: any) => {
    // @ts-ignore
  const longPressTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const previousValueRef = useRef<string>(value);

    const handleTextChange = (text: string | any[]) => {
        const previousValue = previousValueRef.current;
        if (typeof text === "string") {
            previousValueRef.current = text;
        }

        // Check if user is backspacing (text is shorter than before)
        if (text.length < previousValue.length && previousValue.length > 0) {
            // Clear any existing timeout
            if (longPressTimeoutRef.current) {
                clearTimeout(longPressTimeoutRef.current);
            }

            // Set timeout for long press clear (800ms)
            longPressTimeoutRef.current = setTimeout(() => {
                onChangeText(''); // Clear the entire input
                longPressTimeoutRef.current = null;
            }, 800);
        } else {
            // User is typing, clear any timeout
            if (longPressTimeoutRef.current) {
                clearTimeout(longPressTimeoutRef.current);
                longPressTimeoutRef.current = null;
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