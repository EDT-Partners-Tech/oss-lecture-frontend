import React, { useState, useCallback } from 'react';
import { CourseUpdateContext } from './CourseUpdateTypes';

export const CourseUpdateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const triggerUpdate = useCallback(() => {
    setUpdateTrigger(prev => prev + 1);
  }, []);

  return (
    <CourseUpdateContext.Provider value={{ triggerUpdate, updateTrigger }}>
      {children}
    </CourseUpdateContext.Provider>
  );
}; 