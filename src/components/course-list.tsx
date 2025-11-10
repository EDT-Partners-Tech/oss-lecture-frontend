import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { getCourses } from '../services/api';
import { Link } from 'react-router-dom';
import CourseCard from './course-card';
import CardContainer from './card-container';
import useAuth from '../hooks/useAuth';
import { ServiceUI, Course } from '../types';
import { knowledgebaseServicesData } from '../data/servicesData';
import { useTranslation } from 'react-i18next';
import { subscribeToEvent, unsubscribeFromEvent } from '../utils/appsyncEvents';

const CourseList: React.FC = () => {
  const { availableServices } = useAuth();
  const { t } = useTranslation();

  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<string | null>(() => {
    return sessionStorage.getItem('activeCourse');
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    try {
      const fetchedCourses = await getCourses(false);

      // Sort courses by created_at in descending order
      fetchedCourses.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      const initialActiveCourse = sessionStorage.getItem('activeCourse');

      setCourses(fetchedCourses);
      if (fetchedCourses.length > 0) {
        if (!initialActiveCourse || !fetchedCourses.some(course => course.id === initialActiveCourse)) {
          setActiveCourse(fetchedCourses[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError(t('main_dashboard.failed_to_fetch_courses'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    // Suscribirse al evento de actualización
    subscribeToEvent('courseUpdate', fetchCourses);

    // Limpiar la suscripción al desmontar
    return () => {
      unsubscribeFromEvent('courseUpdate', fetchCourses);
    };
  }, [fetchCourses]);

  useEffect(() => {
    if (activeCourse) {
      sessionStorage.setItem('activeCourse', activeCourse);
    }
  }, [activeCourse]);

  const mergedKBServicesData: ServiceUI[] = useMemo(() => {
    return knowledgebaseServicesData
      .map(service => {
        const additionalInfo = availableServices.find(s => s.code === service.code);
        return additionalInfo ? { ...service, ...additionalInfo } : null;
      })
      .filter(service => service !== null) as ServiceUI[];
  }, [availableServices]);

  if (loading) {
    return <p>{t('main_dashboard.loading_courses')}</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <div className="flex">
        <h1 className="text-2xl font-bold mb-4">{t('main_dashboard.courses_title')}</h1>
        <Link to="/add-course" className="ml-auto">
          <button className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-foreground transition duration-300">
            {t('main_dashboard.add_course')}
          </button>
        </Link>
      </div>
      {courses.length === 0 ? (
        <div className="flex items-center justify-center h-32">
          <p className="text-lg text-gray-500">{t('main_dashboard.no_courses_available')}</p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap -mx-2">
            {courses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                isActive={activeCourse === course.id}
                onActiveChange={(id: string) => setActiveCourse(id)}
              />
            ))}
          </div>
          {activeCourse && (
            <div className="mt-5">
              <CardContainer cardData={mergedKBServicesData} id={activeCourse} />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CourseList;
