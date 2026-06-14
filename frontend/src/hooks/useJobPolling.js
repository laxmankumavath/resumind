import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

/**
 * Custom hook to poll a background job endpoint until completion.
 * 
 * @param {string} endpoint - The API endpoint to poll (e.g. `/resumes/analysis/123`)
 * @param {number} interval - Polling interval in ms (default: 3000)
 * @returns {object} { status, data, error, startPolling, stopPolling }
 */
export const useJobPolling = (endpoint, interval = 3000) => {
  const [status, setStatus] = useState('idle'); // idle | polling | completed | failed
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const endpointRef = useRef(endpoint);

  useEffect(() => {
    endpointRef.current = endpoint;
  }, [endpoint]);

  const stopPolling = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const poll = useCallback(async () => {
    if (!endpointRef.current) return;
    
    try {
      const response = await api.get(endpointRef.current);
      const result = response.data.data;
      setData(result);
      
      if (Array.isArray(result)) {
        setStatus('polling');
      } else if (result.status === 'completed') {
        setStatus('completed');
        stopPolling();
      } else if (result.status === 'failed') {
        setStatus('failed');
        setError(result.error || 'Job failed');
        stopPolling();
      } else {
        // Still pending or processing
        setStatus('polling');
      }
    } catch (err) {
      setStatus('failed');
      setError(err.response?.data?.message || err.message || 'Polling error');
      stopPolling();
    }
  }, [stopPolling]);

  const startPolling = useCallback((nextEndpoint) => {
    if (nextEndpoint) {
      endpointRef.current = nextEndpoint;
    }

    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('polling');
    setError(null);
    setData(null);
    
    // Initial fetch right away
    poll();
    
    // Setup interval
    timerRef.current = setInterval(poll, interval);
  }, [poll, interval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return { status, data, error, startPolling, stopPolling };
};
