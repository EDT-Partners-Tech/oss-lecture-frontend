// © [2025] EDT&Partners. Licensed under CC BY 4.0.
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Question } from '../types';
import { getAgentQuestions, getRequestDetail } from '../services/api';
import ListQuestions from './list-questions';

interface RequestDetail {
  title: string;
  questions: Question[];
}

interface RequestQuestionsProps {
  isAgentRequest?: boolean;
}

const RequestQuestions: React.FC<RequestQuestionsProps> = ({ isAgentRequest }) => {
  const { id } = useParams<{ id: string }>();
  const [requestDetail, setRequestDetail] = useState<RequestDetail | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    const fetchRequestDetail = async () => {
      try {
        let data;
        if (isAgentRequest) {
          data = await getAgentQuestions();
          setRequestDetail({
            title: 'Agent Request',
            questions: data.response,
          });
          setQuestions(data.response);
        } else if (id) {
          data = await getRequestDetail(id);
          setRequestDetail(data);
          setQuestions(data.questions);
        } else {
          console.error('ID is undefined');
        }
      } catch (error) {
        console.error('Error fetching request detail:', error);
      }
    };

    fetchRequestDetail();
  }, [id, isAgentRequest]);

  if (!requestDetail) {
    return <div>Loading...</div>;
  }

  return (
    <ListQuestions linkTo="/exam-requests" title={requestDetail.title} questions={questions} />
  );
};

export default RequestQuestions;
