
import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  onClose: () => void;
  type: 'success' | 'reminder';
}

const typeConfig = {
    reminder: {
        style: 'bg-red-100 dark:bg-red-900 border-red-500 text-red-700 dark:text-red-200',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: 'Reminder'
    },
    success: {
        style: 'bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-200',
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        title: 'Success'
    }
};


const Notification: React.FC<NotificationProps> = ({ message, onClose, type }) => {
  const [visible, setVisible] = useState(false);
  const config = typeConfig[type];

  useEffect(() => {
    setVisible(true);
    
    const timer = setTimeout(() => {
      handleClose();
    }, 8000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300); 
  };

  return (
    <div 
        role="alert"
        className={`
          transform transition-all duration-300 ease-in-out
          ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
          w-80 border-l-4 p-4 rounded-lg shadow-lg flex items-start ${config.style}
        `}
    >
      <div className="py-1">
        {config.icon}
      </div>
      <div>
        <p className="font-bold">{config.title}</p>
        <p className="text-sm">{message}</p>
      </div>
      <button onClick={handleClose} className={`ml-auto -mt-2 -mr-2 p-1 rounded-full ${type === 'reminder' ? 'hover:bg-red-200 dark:hover:bg-red-800' : 'hover:bg-green-200 dark:hover:bg-green-800'} transition-colors`} aria-label="Close notification">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default Notification;
