<!-- 
  Copyright 2025 EDT&Partners

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
-->

# Lecture Frontend: A Comprehensive Course Management System

This project is a React-based frontend application for a comprehensive course management system, enabling course creation, exam generation, and interactive learning experiences.

The Lecture Frontend application provides a robust platform for educators to create, manage, and deliver courses efficiently. It offers features such as course creation with automatic knowledge base generation, exam question generation, and interactive chat interfaces for course content.

## Repository Structure

The repository is organized as follows:

- `src/`: Contains the main source code for the application
  - `authentication/`: Authentication-related components and services
  - `components/`: Reusable React components
  - `config/`: Configuration files
  - `data/`: Static data files
  - `hooks/`: Custom React hooks
  - `images/`: Image assets
  - `lib/`: Utility functions
  - `locales/`: Internationalization files
  - `pages/`: Main page components
  - `services/`: API and other service functions
  - `types/`: TypeScript type definitions
- `public/`: Public assets
- `buildspec.yml`: AWS CodeBuild specification file
- `package.json`: Node.js dependencies and scripts
- `tailwind.config.js`: Tailwind CSS configuration
- `vite.config.ts`: Vite build tool configuration

Key files:

- `src/App.tsx`: Main application component and routing setup
- `src/main.tsx`: Application entry point
- `src/services/api.ts`: API service functions
- `src/authentication/authService.ts`: Authentication service functions

## Usage Instructions

### Installation

Prerequisites:

- Node.js (v14 or later)
- npm (v6 or later)

To install the project dependencies, run:

```bash
npm install
```

### Getting Started

To start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:8080`.

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Configuration

The application uses environment variables for configuration. Create a `.env` file in the root directory with the following variables:

```
VITE_BACKEND_SERVER_URL=https://api.edt-technology.com
```

### Sentry Integration

The application includes error monitoring and performance tracking using Sentry. The Sentry client is initialized in `src/main.tsx`:

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://*@*.ingest.de.sentry.io/*",
  integrations: [],
});
```

This allows for automatic error tracking and reporting in the application.

### Testing

To run the linter:

```bash
npm run lint
```

### Common Use Cases

1. User Authentication:
   Use the `LoginPage` component (`src/pages/Login.tsx`) for user sign-in and sign-up functionality.

2. Course Creation:
   Utilize the `CourseCreation` component (`src/components/course-creation.tsx`) to create new courses with automatic knowledge base generation.

3. Exam Generation:
   The `ExamGenerator` component (`src/pages/ExamGenerator/ExamGenerator.tsx`) allows for the creation of exams with various question types.

### Troubleshooting

1. Authentication Issues:

   - Problem: Unable to sign in or sign up
   - Solution: Check the network tab in your browser's developer tools for API errors. Ensure the backend API is accessible and the `VITE_BACKEND_SERVER_URL` is set correctly.

2. File Upload Errors:

   - Problem: Files not uploading during course creation
   - Solution: Verify that the file types are supported and within size limits. Check the browser console for any error messages.

3. Exam Generation Failures:
   - Problem: Exam questions not generating
   - Solution: Ensure that a course title is provided, the number of questions is set, and a file is uploaded. Check the API response for specific error messages.

To enable debug mode, set the `DEBUG` environment variable:

```bash
DEBUG=true npm run dev
```

This will output additional logging information to the browser console.

## Data Flow

The Lecture Frontend application follows a client-server architecture with React on the frontend and a RESTful API backend.

1. User Authentication:

   - User credentials are sent to the Cognito authentication service via the `authService.ts`.
   - Upon successful authentication, JWT tokens are stored in local storage.

2. Course Creation:

   - Course data and materials are sent to the backend API.
   - The backend processes the materials, creates a knowledge base, and returns course information.
   - The frontend polls the backend for status updates during the creation process.

3. Exam Generation:

   - Exam parameters and course materials are sent to the backend API.
   - The API generates questions and returns them to the frontend for display.

4. Content Interaction:
   - User queries are sent to the backend, which interacts with the knowledge base.
   - Responses are returned to the frontend for display in chat interfaces.

```
[User] <-> [React Frontend] <-> [RESTful API] <-> [Backend Services]
                                                   |
                                                   v
                                     [AWS Cognito] [Knowledge Base] [Exam Generator]
```

## Deployment

The application is deployed using AWS CodeBuild and Docker. The `buildspec.yml` file defines the build and deployment process:

1. The application is built and packaged into a Docker image.
2. The image is pushed to Amazon ECR (Elastic Container Registry).
3. The new image is deployed to an EC2 instance using AWS Systems Manager.

## Infrastructure

The `buildspec.yml` file defines the following infrastructure components:

- ECR Repository: `444208416329.dkr.ecr.eu-central-1.amazonaws.com/edt-lecture-frontend`
- EC2 Instance: `i-0a569c1a4a95752b5`
- Docker Network: `my-network`
- Volume Mount: `/data/frontend:/app/frontend`

The deployment process includes logging into ECR, building and pushing the Docker image, and updating the running container on the EC2 instance.

### 📄 License Change (November 24, 2025)

This project was originally released under the **CC BY 4.0** license.  
As of **November 24, 2025**, all source code in this repository is licensed under the **Apache License 2.0**.
