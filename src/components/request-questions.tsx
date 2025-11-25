/*
 * Copyright 2025 EDT&Partners
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
