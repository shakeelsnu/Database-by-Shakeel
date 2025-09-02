import { useState, useEffect } from 'react';
import { defaultFileData } from '../data/fleetData';
import { FileData } from '../types';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      const parsedItem = item ? JSON.parse(item) : initialValue;
      
      // Special handling for excelFilesData to include default fleet data
      if (key === 'excelFilesData' && Array.isArray(parsedItem)) {
        const hasFleetData = parsedItem.some((file: FileData) => file.fileName === 'Fleet Data.csv');
        if (!hasFleetData) {
          const updatedData = [defaultFileData, ...parsedItem];
          window.localStorage.setItem(key, JSON.stringify(updatedData));
          return updatedData as T;
        }
      }
      
      return parsedItem;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}