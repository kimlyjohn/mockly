"use client";

import { useEffect, useRef, useState } from "react";

interface UseAttemptLeaveGuardOptions {
  enabled: boolean;
  hasUnsavedChanges: boolean;
  onSaveBeforeLeave?: () => Promise<void> | void;
  onNavigate: (targetUrl: string) => void;
}

export function useAttemptLeaveGuard({
  enabled,
  hasUnsavedChanges,
  onSaveBeforeLeave,
  onNavigate,
}: UseAttemptLeaveGuardOptions) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const pendingUrlRef = useRef<string | null>(null);

  const requestConfirm = (targetUrl: string) => {
    pendingUrlRef.current = targetUrl;
    setIsConfirmOpen(true);
  };

  const cancelNavigation = () => {
    pendingUrlRef.current = null;
    setIsConfirmOpen(false);
  };

  const confirmNavigation = async () => {
    const targetUrl = pendingUrlRef.current;
    if (!targetUrl) {
      setIsConfirmOpen(false);
      return;
    }

    setConfirming(true);
    try {
      await Promise.resolve(onSaveBeforeLeave?.());
    } finally {
      pendingUrlRef.current = null;
      setConfirming(false);
      setIsConfirmOpen(false);
      onNavigate(targetUrl);
    }
  };

  useEffect(() => {
    if (!enabled || !hasUnsavedChanges) {
      return;
    }

    const currentUrl = window.location.href;

    history.pushState(
      {
        mocklyAttemptGuard: true,
      },
      "",
      currentUrl,
    );

    const onPopState = () => {
      const targetUrl = window.location.href;
      history.pushState({ mocklyAttemptGuard: true }, "", currentUrl);
      if (targetUrl === currentUrl) {
        return;
      }
      requestConfirm(targetUrl);
    };

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) {
        return;
      }

      if (anchor.target === "_blank" || anchor.hasAttribute("download")) {
        return;
      }

      const nextUrl = new URL(anchor.href, window.location.href);
      if (nextUrl.origin !== window.location.origin) {
        return;
      }

      const current = `${window.location.pathname}${window.location.search}`;
      const next = `${nextUrl.pathname}${nextUrl.search}`;
      if (current === next) {
        return;
      }

      event.preventDefault();
      requestConfirm(nextUrl.toString());
    };

    window.addEventListener("popstate", onPopState);
    document.addEventListener("click", onDocumentClick, true);

    return () => {
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onDocumentClick, true);
    };
  }, [enabled, hasUnsavedChanges]);

  return {
    isConfirmOpen,
    confirming,
    cancelNavigation,
    confirmNavigation,
  };
}
