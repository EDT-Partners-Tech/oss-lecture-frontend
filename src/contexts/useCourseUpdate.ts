// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import { useContext } from 'react';
import { CourseUpdateContext } from './CourseUpdateTypes';

export const useCourseUpdate = () => {
  const context = useContext(CourseUpdateContext);
  if (context === undefined) {
    throw new Error('useCourseUpdate must be used within a CourseUpdateProvider');
  }
  return context;
}; 