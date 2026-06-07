'use client';

import { useState, type ReactNode } from 'react';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './Dialog';
import { Button } from './Button';

export type ConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Extra content between description and footer (e.g. a list of affected items). */
  body?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Style of the confirm button: primary (default) or danger (destructive). */
  variant?: 'primary' | 'danger';
  /**
   * Called when the user clicks Confirm. May return a Promise — while pending, the confirm
   * button enters a loading state and both buttons are disabled. Dialog closes after resolve.
   */
  onConfirm?: () => void | Promise<void>;
  size?: 'sm' | 'md' | 'lg';
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  onConfirm,
  size = 'sm',
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);

  const handleConfirm = async () => {
    if (!onConfirm) {
      onOpenChange(false);
      return;
    }
    try {
      setPending(true);
      await onConfirm();
      onOpenChange(false);
    } finally {
      setPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      ariaLabel={typeof title === 'string' ? title : 'Confirm'}
      size={size}
      closeOnBackdropClick={!pending}
      closeOnEscape={!pending}
    >
      <DialogHeader>
        <div>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </div>
        <DialogClose onClick={() => !pending && onOpenChange(false)} />
      </DialogHeader>

      {body && <DialogBody>{body}</DialogBody>}

      <DialogFooter>
        <Button
          variant="ghost"
          onClick={() => onOpenChange(false)}
          disabled={pending}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={handleConfirm}
          disabled={pending}
        >
          {pending ? 'Working…' : confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
