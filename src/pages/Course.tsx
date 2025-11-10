// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React from 'react';
import Layout from '../components/layout';
import CourseCreation from '../components/course-creation';
import { useTranslation } from 'react-i18next';

const Course: React.FC = () => {
  const { t } = useTranslation();
  return (
    <Layout title={t('course_generation.course')}>
      <CourseCreation />
    </Layout>
  );
};

export default Course;
