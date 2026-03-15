"use client";

import {
  EllipsisVertical,
  History,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/Button";
import { getApiErrorMessage, readApiResponse } from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ExamHistoryDialog } from "@/components/dashboard/ExamHistoryDialog";

interface ExamLibraryItemMenuProps {
  examId: string;
  title: string;
  description: string;
}

export function ExamLibraryItemMenu({
  examId,
  title,
  description,
}: ExamLibraryItemMenuProps) {
  const router = useRouter();

  const [editOpen, setEditOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [nextTitle, setNextTitle] = useState(title);
  const [nextDescription, setNextDescription] = useState(description);

  const onSave = async () => {
    const trimmedTitle = nextTitle.trim();
    const trimmedDescription = nextDescription.trim();

    if (!trimmedTitle || !trimmedDescription) {
      setError("Title and description are required.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/exams/${examId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: trimmedTitle,
          description: trimmedDescription,
        }),
      });

      const payload = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(response, payload, "Failed to update exam."),
        );
      }

      setEditOpen(false);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Failed to update exam.",
      );
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/exams/${examId}`, {
        method: "DELETE",
      });

      const payload = await readApiResponse(response);

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(response, payload, "Failed to delete exam."),
        );
      }

      setDeleteConfirmOpen(false);
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Failed to delete exam.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          type="button"
          aria-label="Exam actions"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <EllipsisVertical className="h-4 w-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 min-w-48">
          <DropdownMenuItem
            className="whitespace-nowrap"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setEditOpen(true);
              setError(null);
            }}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setHistoryOpen(true);
              setError(null);
            }}
          >
            <History className="h-4 w-4" />
            History Attempts
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDeleteConfirmOpen(true);
              setError(null);
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ExamHistoryDialog
        examId={examId}
        examTitle={title}
        open={historyOpen}
        onOpenChange={setHistoryOpen}
      />

      {/* Edit Dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!open && !saving) setEditOpen(false);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="exam-title">Title</Label>
              <Input
                id="exam-title"
                value={nextTitle}
                onChange={(e) => setNextTitle(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="exam-description">Description</Label>
              <Textarea
                id="exam-description"
                value={nextDescription}
                onChange={(e) => setNextDescription(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setEditOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void onSave()}
              disabled={saving}
              leftIcon={
                saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null
              }
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onOpenChange={(open) => {
          if (!open && !deleting) setDeleteConfirmOpen(false);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Exam?</DialogTitle>
            <DialogDescription>
              This will permanently delete this exam and all attempts tied to
              it.
            </DialogDescription>
          </DialogHeader>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setDeleteConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void onDelete()}
              disabled={deleting}
              leftIcon={
                deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null
              }
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
