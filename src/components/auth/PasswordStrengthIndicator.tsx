import React from 'react';

interface PasswordStrengthProps {
  password?: string;
}

interface Strength {
  level: 'none' | 'very_weak' | 'weak' | 'medium' | 'strong' | 'very_strong';
  label: string;
  color: string;
  score: number; // 0-4 or 0-5
}

const calculateStrength = (password?: string): Strength => {
  if (!password || password.length === 0) {
    return { level: 'none', label: '', color: 'bg-transparent', score: -1 };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++; // Symbols

  // Adjust score interpretation for more levels if desired
  // Current: 0-1 Very Weak, 2 Weak, 3 Medium, 4 Strong, 5-6 Very Strong
  if (score <= 1) return { level: 'very_weak', label: 'Very Weak', color: 'bg-red-500', score };
  if (score <= 2) return { level: 'weak', label: 'Weak', color: 'bg-orange-500', score };
  if (score <= 3) return { level: 'medium', label: 'Medium', color: 'bg-yellow-500', score };
  if (score <= 4) return { level: 'strong', label: 'Strong', color: 'bg-green-500', score };
  return { level: 'very_strong', label: 'Very Strong', color: 'bg-emerald-600', score };
};

const PasswordStrengthIndicator: React.FC<PasswordStrengthProps> = ({ password }) => {
  const strength = calculateStrength(password);

  if (strength.level === 'none') {
    return null; // Don't render if no password
  }

  const totalSegments = 5;
  const activeSegments = strength.score > 4 ? totalSegments : strength.score; // Cap at total segments

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <p className={`text-sm font-medium ${ 
          strength.level === 'very_weak' ? 'text-red-600' :
          strength.level === 'weak' ? 'text-orange-600' :
          strength.level === 'medium' ? 'text-yellow-600' :
          strength.level === 'strong' ? 'text-green-600' :
          strength.level === 'very_strong' ? 'text-emerald-700' : 'text-gray-500'
        }`}>
          Password strength: {strength.label}
        </p>
      </div>
      <div className="flex space-x-1 h-2">
        {Array.from({ length: totalSegments }).map((_, index) => (
          <div 
            key={index} 
            className={`flex-1 rounded-full ${index < activeSegments ? strength.color : 'bg-gray-300 dark:bg-gray-600'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator; 