import React from 'react';
import Layout from '../components/layout';
import CourseList from '../components/course-list';

const Course: React.FC = () => {
  return (
    <Layout title="Course">
      <CourseList />
    </Layout>
  );
};

export default Course;
