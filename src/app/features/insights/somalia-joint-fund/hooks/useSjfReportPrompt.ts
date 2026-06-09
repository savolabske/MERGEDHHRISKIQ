import { useCallback, useEffect, useRef, useState } from 'react';
import { REPORT_QUERY_DELAY_MS, REPORT_STICKY_HEADER_OFFSET } from '../../shared/constants';
import { getRecipeAssistantReply, resolveSjfRecipe } from '../data/sjfPromptRecipes';
import type { SjfRecipeResult } from '../types';

export function useSjfReportPrompt() {
  const [promptInput, setPromptInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [resultMode, setResultMode] = useState(false);
  const [resultTitle, setResultTitle] = useState('SJF overview');
  const [activeRecipe, setActiveRecipe] = useState<SjfRecipeResult | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);

  const resultSectionRef = useRef<HTMLElement>(null);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const queryTimeoutRef = useRef<number | null>(null);
  const isQueryingRef = useRef(false);

  const cancelQuery = useCallback(() => {
    if (queryTimeoutRef.current !== null) {
      window.clearTimeout(queryTimeoutRef.current);
      queryTimeoutRef.current = null;
    }
    isQueryingRef.current = false;
    setIsQuerying(false);
  }, []);

  const backToReport = useCallback(() => {
    cancelQuery();
    setResultMode(false);
    setActiveRecipe(null);
  }, [cancelQuery]);

  const runPrompt = useCallback(
    (query?: string) => {
      const q = (query ?? promptInput).trim();
      if (!q || isQueryingRef.current) return;

      const recipe = resolveSjfRecipe(q, false);
      setActiveRecipe(recipe);
      setMessages((prev) => [...prev, q]);
      setResultTitle(recipe.title);
      setPromptInput('');
      isQueryingRef.current = true;
      setIsQuerying(true);

      queryTimeoutRef.current = window.setTimeout(() => {
        setMessages((prev) => [...prev, getRecipeAssistantReply(recipe)]);
        isQueryingRef.current = false;
        setIsQuerying(false);
        setResultMode(true);
        queryTimeoutRef.current = null;
      }, REPORT_QUERY_DELAY_MS);
    },
    [promptInput],
  );

  useEffect(() => {
    return () => {
      if (queryTimeoutRef.current !== null) {
        window.clearTimeout(queryTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!resultMode) return;

    const scrollResultsToTop = () => {
      const target = resultSectionRef.current;
      const scrollRoot =
        target?.closest<HTMLElement>('[data-report-scroll]') ??
        document.querySelector<HTMLElement>('[data-report-scroll]');
      if (!scrollRoot) return;

      const rootTop = scrollRoot.getBoundingClientRect().top;
      const targetTop = target.getBoundingClientRect().top;
      const offset = targetTop - rootTop + scrollRoot.scrollTop - REPORT_STICKY_HEADER_OFFSET;
      scrollRoot.scrollTo({ top: Math.max(0, offset), behavior: 'smooth' });
    };

    const frame = requestAnimationFrame(scrollResultsToTop);
    return () => cancelAnimationFrame(frame);
  }, [resultMode]);

  useEffect(() => {
    const el = chatScrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, isQuerying]);

  return {
    promptInput,
    setPromptInput,
    messages,
    resultMode,
    resultTitle,
    activeRecipe,
    isQuerying,
    resultSectionRef,
    chatScrollRef,
    runPrompt,
    backToReport,
  };
}
