"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface LeaveAttemptModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirming?: boolean;
}

export function LeaveAttemptModal({
  isOpen,
  onCancel,
  onConfirm,
  confirming = false,
}: LeaveAttemptModalProps) {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !confirming) {
          onCancel();
        }
      }}
    >
      <DialogContent className="max-w-md" showCloseButton={false}>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <DialogTitle>Leave attempt session?</DialogTitle>
              <DialogDescription className="mt-1">
                You have an in-progress attempt. Any unsaved progress may be
                lost if you leave now.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={onCancel} disabled={confirming}>
            Stay Here
          </Button>
          <Button onClick={onConfirm} disabled={confirming}>
            {confirming ? "Leaving..." : "Leave Page"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
