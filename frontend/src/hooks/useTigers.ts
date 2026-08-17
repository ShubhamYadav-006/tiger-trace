import { useState, useEffect } from 'react';
import type { Tiger } from '../types/tiger';
import { getTigers } from '../services/tigers';

export const useTigers = () => {
  const [tigers, setTigers] = useState<Tiger[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    getTigers()
      .then((data) => {
        if (isMounted) {
          setTigers(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch tigers');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { tigers, loading, error };
};
