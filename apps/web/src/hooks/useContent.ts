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
        console.log(result);
        if (isMounted) setData(result);
      } catch (err) {
        console.error(`Error fetching single content [${code}]:`, err);
      } finally {
        console.log('Loading finished');
        if (isMounted) setLoading(false);
      }
    };
    fetch();
    return () => { isMounted = false; };
  }, [code]);

  return { data, loading };
}

/**
 * Hook para saber si una sección (Collection) está activa en el CMS.
 */
export function useSectionVisibility(code: string) {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetch = async () => {
      try {
        const result = await PublicContentService.checkVisibility(code);
        if (isMounted) setIsVisible(result);
      } catch (err) {
        if (isMounted) setIsVisible(true);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetch();
    return () => { isMounted = false; };
  }, [code]);

  return { isVisible, loading };
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
        console.log(result);
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