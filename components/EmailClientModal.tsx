
import React from 'react';

interface EmailClientModalProps {
  onClose: () => void;
}

const EmailClientModal: React.FC<EmailClientModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-dark-card rounded-lg p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Email Client</h2>
        <p className="text-gray-600 dark:text-gray-400">This is a placeholder for a simulated email client view.</p>
        <div className="flex justify-end mt-6">
          <button onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailClientModal;
