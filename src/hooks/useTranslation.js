import { useState, useCallback, useRef } from 'react';
import axios from 'axios';

const ENV_API_URL = process.env.REACT_APP_BACKEND_URL;
const API_URL = ENV_API_URL === 'undefined' || !ENV_API_URL ? '' : ENV_API_URL;

/**
 * useTranslation — translates an array of text strings via the backend.
 * Caches results keyed by (text+targetLang) to avoid re-translating.
 */
export function useTranslation() {
  const cache = useRef({}); // { `${text}::${lang}` -> translatedText }
  const [translating, setTranslating] = useState(false);

  const translate = useCallback(async (texts, targetLanguage) => {
    if (!texts || texts.length === 0) return [];

    // Check which ones are already cached
    const uncachedIdxs = [];
    const uncachedTexts = [];
    texts.forEach((txt, i) => {
      const key = `${txt}::${targetLanguage}`;
      if (!cache.current[key]) {
        uncachedIdxs.push(i);
        uncachedTexts.push(txt);
      }
    });

    if (uncachedTexts.length > 0) {
      setTranslating(true);
      try {
        const res = await axios.post(`${API_URL}/api/translate`, {
          texts: uncachedTexts,
          target_language: targetLanguage
        });
        const translated = res.data.translations || uncachedTexts;
        uncachedTexts.forEach((txt, i) => {
          const key = `${txt}::${targetLanguage}`;
          cache.current[key] = translated[i] || txt;
        });
      } catch {
        // On error, use originals
        uncachedTexts.forEach(txt => {
          const key = `${txt}::${targetLanguage}`;
          cache.current[key] = txt;
        });
      } finally {
        setTranslating(false);
      }
    }

    // Return all translated
    return texts.map(txt => cache.current[`${txt}::${targetLanguage}`] || txt);
  }, []);

  return { translate, translating };
}
