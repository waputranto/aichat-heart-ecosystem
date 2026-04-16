/**
 * useAsync Hook
 * Handle async operations with loading and error states
 */

import { useState, useEffect } from 'react';

export function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState('idle');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const execute = async () => {
    setStatus('pending');
    setData(null);
    setError(null);
    try {
      const response = await asyncFunction();
      setData(response);
      setStatus('success');
      return response;
    } catch (err) {
      setError(err);
      setStatus('error');
      throw err;
    }
  };

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]);

  return { execute, status, data, error };
}

export default useAsync;
