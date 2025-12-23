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
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-sm">📚</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800">Course Information</h3>
      </div>
      
      <div className="space-y-6">
        <div>
          <label htmlFor="syllabus" className="block text-sm font-semibold text-gray-700 mb-2">
            Course Syllabus *
          </label>
          <textarea
            id="syllabus"
            value={syllabus}
            onChange={handleSyllabusChange}
            placeholder="Paste your course syllabus content here. Include key topics, learning objectives, and curriculum details..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Provide detailed syllabus content for accurate evaluation alignment
          </p>
        </div>

        <div>
          <label htmlFor="objectives" className="block text-sm font-semibold text-gray-700 mb-2">
            Teaching Objectives (Optional)
          </label>
          <textarea
            id="objectives"
            value={objectives}
            onChange={handleObjectivesChange}
            placeholder="Specify learning outcomes and teaching goals for this particular lecture session..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Optional: Add specific objectives for more targeted evaluation
          </p>
        </div>

        {syllabus.trim() && (
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <div className="flex items-center space-x-2">
              <span className="text-purple-600">✓</span>
              <p className="text-sm font-medium text-purple-800">
                Syllabus content added ({syllabus.length} characters)
              </p>
            </div>
            {objectives.trim() && (
              <p className="text-xs text-purple-600 mt-1">
                Teaching objectives included
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SyllabusInput;