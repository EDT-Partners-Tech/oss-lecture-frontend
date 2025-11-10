import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Question } from '../types';
import { Document, Paragraph, HeadingLevel, AlignmentType, Packer } from 'docx';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseJwt(token: string) {
  if (!token) {
    console.error('No token provided to parseJwt');
    return null;
  }

  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid token format');
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT token:', error);
    return null;
  }
}

export const toTitleCase = (str: string) => {
  return str
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export function createDownloadLink(content: string) {
  const blob = new Blob([content], { type: 'text/plain' });
  return URL.createObjectURL(blob);
}

export function removeExtension(filename: string): string {
  const lastDotIndex = filename.lastIndexOf('.');

  if (lastDotIndex === -1 || lastDotIndex === 0) {
    return filename;
  }

  return filename.slice(0, lastDotIndex);
}

export function convertToAiken(questions: Question[]): string {
  return (
    questions
      .filter(question => question.type !== 'open')
      .map(question => {
        if (!question.options || question.options.length === 0) {
          return;
        }

        const options = question.options
          .map((option, idx) => {
            const letter = String.fromCharCode(65 + idx);
            return `${letter}. ${option}`;
          })
          .join('\n');

        const correctIndex = question.options.indexOf(question.correct_answer || '');
        const correctLetter =
          correctIndex !== -1 ? String.fromCharCode(65 + correctIndex) : 'Invalid';

        return `${question.question}\n${options}\nANSWER: ${correctLetter}`;
      })
      .join('\n\n') + '\n'
  );
}

export function convertToGIFT(questions: Question[]): string {
  return questions
    .map((question) => {
      let giftQuestion = `::${question.question}:: {`;

      if (question.type === 'mcq') {
        giftQuestion += '\n';

        if (question.options && question.options.length > 0) {
          const answers = question.options
            .map(option => {
              const isCorrect = question.correct_answer === option;
              const prefix = isCorrect ? '=' : '~';
              return `${prefix}${option}`;
            })
            .join('\n');
          giftQuestion += `${answers}\n}`;
        } else {
          giftQuestion += 'Invalid question (no options provided)\n}';
        }
      } else if (question.type === 'tf') {
        const correct = question.correct_answer?.toLowerCase() === 'true' ? 'T' : 'F';
        giftQuestion += `${correct}}\n`;
      } else if (question.type === 'open') {
        giftQuestion += `}\n`;
      }

      return giftQuestion;
    })
    .join('\n\n');
}

export function generateDocFile(questions: Question[]) {
  return new Document({
    sections: [
      {
        properties: {},
        children: [
          // Add a title to the document
          new Paragraph({
            text: 'Exam Questions',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
          }),
          ...questions.flatMap((question, index) => {
            const questionParagraphs = [
              // Add the question heading
              new Paragraph({
                text: `Question ${index + 1}`,
                heading: HeadingLevel.HEADING_2,
              }),
              new Paragraph({
                text: question.question,
              }),
            ];

            // Add options if available
            if (question.options) {
              questionParagraphs.push(
                new Paragraph({
                  text: 'Options:',
                  run: {
                    bold: true,
                  },
                }),
                ...question.options.map(
                  (option, idx) =>
                    new Paragraph({
                      text: `${String.fromCharCode(65 + idx)}. ${option}`,
                      bullet: {
                        level: 0,
                      },
                    })
                )
              );
            }

            // Add correct answer if available
            if (question.correct_answer) {
              questionParagraphs.push(
                new Paragraph({
                  text: `Correct Answer: ${question.correct_answer}`,
                  run: {
                    bold: true,
                  },
                })
              );
            }

            // Add reason if available
            if (question.reason) {
              questionParagraphs.push(
                new Paragraph({
                  text: `Reason: ${question.reason}`,
                  run: {
                    italics: true,
                  },
                })
              );
            }

            questionParagraphs.push(new Paragraph(''));

            return questionParagraphs;
          }),
        ],
      },
    ],
  });
}

export function downloadFile(questions: Question[], format: 'GIFT' | 'Aiken' | 'docx') {
  let content: string;
  let filename: string;

  if (format === 'GIFT') {
    content = convertToGIFT(questions);
    filename = 'questions.gift';
  } else if (format === 'Aiken') {
    content = convertToAiken(questions);
    filename = 'questions.aiken';
  } else if (format === 'docx') {
    const doc = generateDocFile(questions);
    Packer.toBlob(doc).then(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'questions.docx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
    return;
  } else {
    throw new Error('Unsupported format');
  }

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export const downloadDocx = async (text: string, title: string) => {
  try {
    const paragraphs = text.split('\n').map(line => {
      return new Paragraph({
        text: line,
      });
    });

    const docxDocument = new Document({
      sections: [
        {
          children: paragraphs,
        },
      ],
    });

    Packer.toBlob(docxDocument).then(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${removeExtension(title)}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  } catch (error) {
    console.error('Error creating or downloading docx file:', error);
  }
};

export const blobToFile = (theBlob: Blob, fileName: string, fileType: string): File => {
  //A Blob() is almost a File() - it's just missing the two properties below which we will add
  const file = new File([theBlob], fileName, { type: fileType });
  return file;
};

export const formatCitation = (citation: string): string => {
  // Split content into segments based on patterns (bullet points, numbered lists, or extra spaces)
  const segments = citation.split(/(?=•|\d+\.\s| {2,})/g);

  return segments
    .map(segment => {
      const trimmedSegment = segment.trim();

      if (trimmedSegment.startsWith('•')) {
        // Convert bullets to markdown list items
        return `- ${trimmedSegment.slice(1).trim()}`;
      } else if (/^\d+\.\s/.test(trimmedSegment)) {
        // Preserve numbered lists
        return `${trimmedSegment}`;
      } else if (trimmedSegment.match(/^\w+:/)) {
        // Treat lines starting with "word:" as headers
        return `### ${trimmedSegment}`;
      } else if (/ {2,}/.test(segment)) {
        // Condense sections with multiple spaces into a paragraph
        return trimmedSegment.replace(/ {2,}/g, ' ');
      }
      // Default: treat as a paragraph
      return trimmedSegment;
    })
    .join('\n\n'); // Add spacing between formatted blocks
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
