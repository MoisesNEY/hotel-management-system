import { useState, useEffect } from 'react';
import { PublicContentService } from '../services/public/publicContentService';
import type { WebContent } from '../types/webContentTypes';

// Sobrecarga para Single
export function useSingleContent(code: string) {
  const [data, setData] = useState<WebContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      try {
        const result = await PublicContentService.getSingle(code);
        if (isMounted) setData(result);
      } catch (err) {
        console.error(`Error fetching single content [${code}]:`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetch();
    return () => { isMounted = false; };
  }, [code]);

  return { data, loading };
}

// Sobrecarga para Listas
export function useListContent(code: string) {
  const [data, setData] = useState<WebContent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      try {
        const result = await PublicContentService.getList(code);
        if (isMounted) setData(result);
      } catch (err) {
        console.error(`Error fetching list content [${code}]:`, err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetch();
    return () => { isMounted = false; };
  }, [code]);

  return { data, loading };
}