
import React from 'react';
import { useTasks } from '../context/TaskContext';
import UserAvatar from './UserAvatar';

const Header: React.FC = () => {
  const { currentUser, logout } = useTasks();

  if (!currentUser) {
    return null; // Should not happen in authenticated app
  }

  return (
    <>
      <header className="bg-white dark:bg-dark-card shadow-md p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-primary" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
          </svg>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            Team Task Manager
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
              <UserAvatar name={currentUser.name} avatarUrl={currentUser.avatarUrl} userId={currentUser.id} size="lg" />
              <div className="text-right hidden sm:block">
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{currentUser.name}</p>
                  <p className={`text-xs ${currentUser.role === 'Admin' ? 'text-brand-primary' : 'text-brand-secondary'}`}>{currentUser.role}</p>
              </div>
          </div>
          <button
              onClick={logout}
              className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors flex items-center space-x-2"
              aria-label="Logout"
          >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
              </svg>
            <span className="hidden md:inline">Logout</span>
          </button>
        </div>
      </header>
    </>
  );
};

export default Header;
