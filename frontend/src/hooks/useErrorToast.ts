import { useState, useCallback } from 'react';

interface ErrorToastState {
  message: string;
  id: number;
}

export function useErrorToast() {
  const [errors, setErrors] = useState<ErrorToastState[]>([]);

  const showError = useCallback((message: string) => {
    const id = Date.now();
    setErrors((prev) => [...prev, { message, id }]);
  }, []);

  const removeError = useCallback((id: number) => {
    setErrors((prev) => prev.filter((error) => error.id !== id));
  }, []);

  return { errors, showError, removeError };
}

