import { useState, useEffect, useCallback } from 'react';
import {
  getReflections,
  saveReflection as saveReflectionToStorage,
  updateReflection as updateReflectionInStorage,
  deleteReflection as deleteReflectionFromStorage,
} from '../data/storage';

/**
 * Hook that keeps the reflections list in sync with storage and exposes add/update/delete.
 * Screens use this so they always see the latest data after any change.
 */
export function useReflections() {
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const list = await getReflections();
    setReflections(list);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addReflection = useCallback(
    async (reflection) => {
      await saveReflectionToStorage(reflection);
      await refresh();
    },
    [refresh]
  );

  const updateReflection = useCallback(
    async (updated) => {
      await updateReflectionInStorage(updated);
      await refresh();
    },
    [refresh]
  );

  const deleteReflection = useCallback(
    async (id) => {
      await deleteReflectionFromStorage(id);
      await refresh();
    },
    [refresh]
  );

  return { reflections, loading, refresh, addReflection, updateReflection, deleteReflection };
}
