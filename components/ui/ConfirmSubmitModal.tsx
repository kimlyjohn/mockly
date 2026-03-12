"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "./Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

interface ConfirmSubmitModalProps {
  isOpen: boolean;
  unansweredCount: number;
  flaggedCount: number;
  onCancel: () => void;
  onConfirm: () => void;
  disableConfirm?: boolean;
  confirmLabel?: string;
}

export function ConfirmSubmitModal({
  isOpen,
  unansweredCount,
  flaggedCount,
  onCancel,
  onConfirm,
  disableConfirm = false,
  confirmLabel = "Submit Anyway",
}: ConfirmSubmitModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent showCloseButton={false} className="max-w-md">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <DialogTitle>Submit exam now?</DialogTitle>
              <DialogDescription className="mt-1">
                You have{" "}
                <span className="font-semibold text-foreground">
                  {unansweredCount}
                </span>{" "}
                unanswered question{unansweredCount === 1 ? "" : "s"}
                {flaggedCount > 0 && (
                  <>
                    {" "}
                    and{" "}
                    <span className="font-semibold text-foreground">
                      {flaggedCount}
                    </span>{" "}
                    flagged question{flaggedCount === 1 ? "" : "s"}
                  </>
                )}
                .
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>
            Go Back
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={disableConfirm}
            leftIcon={
              disableConfirm ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null
            }
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
