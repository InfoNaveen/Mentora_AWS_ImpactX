/**
 * Chart Components for Results Visualization
 */
import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface RadarData {
  subject: string;
  score: number;
  fullMark: number;
}

interface BarData {
  name: string;
  score: number;
}

export const ScoringRadar: React.FC<{ data: RadarData[] }> = ({ data }) => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#2d3748" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={[0, 10]}
            tick={{ fill: '#64748b', fontSize: 10 }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke="#1a73e8"
            fill="#1a73e8"
            fillOpacity={0.6}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ScoringBar: React.FC<{ data: BarData[] }> = ({ data }) => {
  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
            axisLine={{ stroke: '#2d3748' }}
          />
          <YAxis
            domain={[0, 10]}
            tick={{ fill: '#64748b', fontSize: 10 }}
            axisLine={{ stroke: '#2d3748' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#151a22',
              borderColor: '#2d3748',
              borderRadius: '6px',
              color: '#f1f5f9',
            }}
            itemStyle={{ color: '#1a73e8' }}
          />
          <Bar dataKey="score" fill="#1a73e8" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

