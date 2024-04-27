import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import React, { useEffect } from 'react';
import './index.scss';
import { CustomCopilotTextarea } from '@/components/common/custom-copilot-textarea';

interface DataProps {
  front: any;
  back: any;
}

interface FlashcardEditorDialogProps {
  data?: DataProps;
  onSave: (data: DataProps) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function FlashcardEditorDialog({
  data,
  onSave,
  onDelete,
  onClose,
}: FlashcardEditorDialogProps) {
  const [state, setState] = React.useState<DataProps>({
    front: '',
    back: '',
  });
  const [open, setOpen] = React.useState(true);

  useEffect(() => {
    if (!open) {
      onClose();
    }
  }, [open]);

  useEffect(() => {
    if (data) {
      setState(data);
    }
  }, [data]);

  return (
    <Dialog open={open} onOpenChange={(val) => setOpen(val)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit flashcard</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="min-h-[100px]">
            <CustomCopilotTextarea
              placeholder="Front of the card"
              textareaPurpose="Front page of the flashcard. Likely a question."
              defaultValue={state.front || ''}
              onDebouncedUpdate={(val) => {
                setState((prev: any) => ({ ...prev, front: val }));
              }}
            />
          </div>
          <Separator />
          <div className="min-h-[100px]">
            <CustomCopilotTextarea
              placeholder="Back of the card"
              textareaPurpose="Back page of the flashcard. Likely an answer."
              defaultValue={state.front || ''}
              onDebouncedUpdate={(val) => {
                setState((prev: any) => ({ ...prev, back: val }));
              }}
            />
          </div>
        </div>
        <DialogFooter>
          {!!data && (
            <Button size={'sm'} variant={'destructive'} onClick={onDelete}>
              Delete
            </Button>
          )}
          <DialogClose asChild>
            <Button
              size={'sm'}
              variant={'default'}
              disabled={!state.front || !state.back}
              onClick={() => onSave(state)}
            >
              Save
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
