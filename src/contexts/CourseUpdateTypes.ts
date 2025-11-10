import { createContext } from 'react';
import { CourseUpdateContextType } from '../types';

export const CourseUpdateContext = createContext<CourseUpdateContextType | undefined>(undefined); 