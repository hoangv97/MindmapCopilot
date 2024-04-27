import { nanoid } from 'nanoid';

export interface FlashcardProps {
  id: string;
  front: any;
  back: any;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateFlashcardProps {
  id?: string;
  front?: any;
  back?: any;
}

export const getNewFlashcard = (
  flashcard: UpdateFlashcardProps
): FlashcardProps => {
  return {
    id: nanoid(),
    front: flashcard.front || '',
    back: flashcard.back || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

export const getUpdateFlashcard = (flashcard: FlashcardProps) => {
  return {
    ...flashcard,
    updatedAt: new Date().toISOString(),
  };
};
