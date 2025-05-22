import React from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

interface ErrorDisplayProps {
  error: string;
  onReload?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onReload }) => {
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
      <div className="flex">
        <div className="flex-shrink-0">
          <HiOutlineExclamationCircle className="h-5 w-5 text-red-400" />
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{error}</p>
          {onReload && (
            <button
              onClick={onReload}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
            >
              再試行
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay; 