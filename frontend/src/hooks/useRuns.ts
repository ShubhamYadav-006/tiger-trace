import { useState, useEffect, useCallback } from 'react';
import type { ProcessingRun } from '../types/run';
import { getAllRuns, getRunById, startProcessingRun } from '../services/runs';

export const useRuns = () => {
  const [runs, setRuns] = useState<ProcessingRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<ProcessingRun | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRuns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllRuns();
      setRuns(data);
      if (data.length > 0 && !selectedRun) {
        setSelectedRun(data[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch processing runs');
    } finally {
      setLoading(false);
    }
  }, [selectedRun]);

  const selectRun = async (id: string) => {
    try {
      const run = await getRunById(id);
      if (run) {
        setSelectedRun(run);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load run details');
    }
  };

  const createRun = async (folderPath: string) => {
    try {
      const newRun = await startProcessingRun(folderPath);
      setRuns((prev) => [newRun, ...prev]);
      setSelectedRun(newRun);
      return newRun;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start processing run');
      throw err;
    }
  };

  useEffect(() => {
    fetchRuns();
  }, [fetchRuns]);

  return {
    runs,
    selectedRun,
    loading,
    error,
    selectRun,
    createRun,
    refresh: fetchRuns,
  };
};
