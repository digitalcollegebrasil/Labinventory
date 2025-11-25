import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon?: LucideIcon; // Icon is optional now as per design
  color: string; // Tailwind class like 'bg-blue-50'
  textColor: string; // Tailwind class like 'text-blue-600'
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, color, textColor }) => {
  return (
    <div className={`${color} rounded-xl p-6 flex flex-col justify-between h-32 transition-transform hover:scale-105`}>
      <div>
        <h3 className={`text-4xl font-bold ${textColor} mb-1`}>{value}</h3>
        <p className="text-sm text-gray-600 font-medium">{title}</p>
      </div>
    </div>
  );
};
