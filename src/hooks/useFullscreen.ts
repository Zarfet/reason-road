import { useCallback, useEffect, useState } from 'react';

/**
 * useFullscreen — Fullscreen API toggle + keyboard shortcut
 *
 * Default shortcut: "f" (ignored when typing in inputs/textareas/contenteditable).
 * Esc exits fullscreen automatically (handled by the browser).
 */
export function useFullscreen(shortcutKey: string = 'f') {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(
    typeof document !== 'undefined' && !!document.fullscreenElement
  );

  const enter = useCallback(async (element?: Element) => {
    const target = element ?? document.documentElement;
    if (target.requestFullscreen) {
      try {
        await target.requestFullscreen();
      } catch (err) {
        console.warn('Fullscreen request failed:', err);
      }
    }
  }, []);

  const exit = useCallback(async () => {
    if (document.fullscreenElement && document.exitFullscreen) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.warn('Fullscreen exit failed:', err);
      }
    }
  }, []);

  const toggle = useCallback(
    async (element?: Element) => {
      if (document.fullscreenElement) {
        await exit();
      } else {
        await enter(element);
      }
    },
    [enter, exit]
  );

  // Track native fullscreen state changes (Esc, system controls, etc.)
  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleChange);
    return () => document.removeEventListener('fullscreenchange', handleChange);
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    if (!shortcutKey) return;

    const isEditableTarget = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) return false;
      const tag = target.tagName;
      return (
        tag === 'INPUT' ||
        tag === 'TEXTAREA' ||
        tag === 'SELECT' ||
        target.isContentEditable
      );
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key.toLowerCase() !== shortcutKey.toLowerCase()) return;
      if (isEditableTarget(e.target)) return;

      e.preventDefault();
      void toggle();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutKey, toggle]);

  return { isFullscreen, toggle, enter, exit };
}
