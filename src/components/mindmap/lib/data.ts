import storage from '@/lib/storage';
import { nanoid } from 'nanoid';

export interface FileProps {
  id: string;
  name: string;
  data: string;
  createdAt: string;
  updatedAt: string;
}

export const getData = () => {
  return storage.getLocalStorage(storage.KEYS.mindmapData, {});
};

export const saveData = (newData: any) => {
  const currentData = getData();
  storage.setLocalStorage(storage.KEYS.mindmapData, {
    ...currentData,
    ...newData,
  });
};

export const getFiles = (): FileProps[] => {
  const data = getData();
  const files = data.files || [];
  files.sort((a: any, b: any) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  return files;
};

export const saveFiles = (files: FileProps[]) => {
  saveData({ files });
};

export const createFile = (name: string, data: any) => {
  const files = getFiles();
  const newFile = {
    id: nanoid(),
    name,
    data: JSON.stringify(data),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  files.push(newFile);
  saveFiles(files);
  return newFile;
};

export const updateFile = (id: string, data: any) => {
  const files = getFiles();
  const file = files.find((file) => file.id === id);
  if (file) {
    file.data = JSON.stringify(data);
    file.updatedAt = new Date().toISOString();
    saveFiles(files);
  }
};

export const deleteFile = (id: string) => {
  const files = getFiles();
  saveFiles(files.filter((file) => file.id !== id));
};

export const getCurrentFile = () => {
  const data = getData();
  const { currentFileId } = data;
  if (currentFileId) {
    const files = getFiles();
    const file = files.find((file) => file.id === currentFileId);
    if (file) {
      return file;
    }
    saveCurrentFile();
  }
  return null;
};

export const saveCurrentFile = (id?: string) => {
  saveData({ currentFileId: id });
};
