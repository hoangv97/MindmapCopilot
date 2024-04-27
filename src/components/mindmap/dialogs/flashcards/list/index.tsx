import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import React, { useEffect } from 'react';

interface FlashcardListDialogProps {
  onClose: () => void;
}

export default function FlashcardListDialog({
  onClose,
}: FlashcardListDialogProps) {
  const [open, setOpen] = React.useState(true);

  useEffect(() => {
    if (!open) {
      onClose();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(val) => setOpen(val)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Flashcards</DialogTitle>
        </DialogHeader>
        <div className="py-4"></div>
      </DialogContent>
    </Dialog>
  );
}
