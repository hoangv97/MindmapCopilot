import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import React, { useEffect } from 'react';
import { deleteFile, getFiles } from '../../lib/data';

interface RestoreDialogProps {
  onRestore: (file: any) => void;
  onClose: () => void;
}

export default function FilesDialog({
  onRestore,
  onClose,
}: RestoreDialogProps) {
  const [open, setOpen] = React.useState(true);
  const [files, setFiles] = React.useState<any[]>(getFiles());
  const [selectedFile, setSelectedFile] = React.useState<any>();

  useEffect(() => {
    if (!open) {
      onClose();
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        setFiles(getFiles());
      }}
    >
      <DialogTrigger asChild>
        <div className="cursor-pointer hover:font-bold">Files</div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Your files</DialogTitle>
          <DialogDescription>Manage your files here.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {files.map((file) => (
            <div className="" key={file.id}>
              <div
                className={`cursor-pointer hover:font-bold ${
                  selectedFile?.id === file.id ? 'font-bold' : ''
                }`}
                onClick={() => setSelectedFile(file)}
              >
                {file.name} ({new Date(file.createdAt).toLocaleString()})
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          {!!selectedFile && (
            <>
              <Button
                variant={'destructive'}
                size="sm"
                onClick={() => {
                  if (
                    window.confirm('Are you sure you want to delete this file?')
                  ) {
                    deleteFile(selectedFile.id);
                    const newFiles = getFiles();
                    setFiles(newFiles);
                    setSelectedFile(undefined);
                  }
                }}
              >
                Delete
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onRestore(selectedFile);
                  setOpen(false);
                }}
              >
                Load
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
