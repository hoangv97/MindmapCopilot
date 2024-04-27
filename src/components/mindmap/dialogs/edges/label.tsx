import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import React, { useEffect } from 'react';

interface EdgeLabelDialogProps {
  onSave: () => void;
  onClose: () => void;
}

export default function EdgeLabelDialog({
  onSave,
  onClose,
}: EdgeLabelDialogProps) {
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
          <DialogTitle>Edit Edge</DialogTitle>
        </DialogHeader>
        <div className="py-4"></div>
        <DialogFooter>
          <DialogClose asChild>
            <Button size={'sm'} variant={'default'} onClick={() => onSave()}>
              Save
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
