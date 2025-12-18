import React, { useState } from 'react';

interface SyllabusInputProps {
  onSyllabusChange: (syllabus: string, objectives?: string) => void;
}

const SyllabusInput: React.FC<SyllabusInputProps> = ({ onSyllabusChange }) => {
  const [syllabus, setSyllabus] = useState('');
  const [objectives, setObjectives] = useState('');

  const handleSyllabusChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setSyllabus(value);
    onSyllabusChange(value, objectives);
  };

  const handleObjectivesChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = event.target.value;
    setObjectives(value);
    onSyllabusChange(syllabus, value);
  };

  return (
    <div className="syllabus-container">
      <h2>Course Information</h2>
      
      <div className="input-group">
        <label htmlFor="syllabus">Syllabus Content *</label>
        <textarea
          id="syllabus"
          value={syllabus}
          onChange={handleSyllabusChange}
          placeholder="Paste your course syllabus here..."
          rows={8}
          className="syllabus-textarea"
        />
      </div>

      <div className="input-group">
        <label htmlFor="objectives">Teaching Objectives (Optional)</label>
        <textarea
          id="objectives"
          value={objectives}
          onChange={handleObjectivesChange}
          placeholder="Enter specific teaching objectives for this lecture..."
          rows={4}
          className="objectives-textarea"
        />
      </div>

      <style jsx>{`
        .syllabus-container {
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 8px;
          margin-bottom: 20px;
        }

        .input-group {
          margin-bottom: 20px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #333;
        }

        .syllabus-textarea,
        .objectives-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
        }

        .syllabus-textarea:focus,
        .objectives-textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .syllabus-textarea {
          min-height: 120px;
        }

        .objectives-textarea {
          min-height: 80px;
        }
      `}</style>
    </div>
  );
};

export default SyllabusInput;