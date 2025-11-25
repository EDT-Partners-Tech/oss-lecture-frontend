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

import React, { FunctionComponent, SVGProps } from 'react';
import { IconType } from 'react-icons';
import { useNavigate } from 'react-router-dom';

interface CardProps {
  icon: IconType | FunctionComponent<SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
  bgColor: string;
  url?: string;
}

const ServiceCard: React.FC<CardProps> = ({ icon: Icon, title, description, bgColor, url }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (url) {
      navigate(url);
    }
  };
  return (
    <button
      className="relative flex bg-white p-4 shadow rounded-lg items-center cursor-pointer group overflow-hidden"
      onClick={handleClick}
    >
      <div className="absolute rounded-lg inset-0 border-0 group-hover:border-2 group-hover:border-gray-500 transition-all duration-500 ease-in-out">
        <div className="absolute rounded-lg inset-0 border-t-2 border-l-2 border-gray-500 transform origin-top-left group-hover:scale-x-100 scale-x-0 transition-transform duration-500 ease-in-out" />
        <div className="absolute rounded-lg inset-0 border-b-2 border-r-2 border-gray-500 transform origin-bottom-right group-hover:scale-x-100 scale-x-0 transition-transform duration-500 ease-in-out" />
      </div>
      <div className={`flex items-center justify-center self-baseline p-2 rounded-lg ${bgColor}`}>
        <Icon className="text-2xl" />
      </div>
      <div className="ml-4 flex flex-col justify-start align-top h-full text-left">
        <h3 className="text-md font-semibold">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </button>
  );
};

export default ServiceCard;
