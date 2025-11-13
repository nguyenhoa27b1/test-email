//Thiết kế giao diện hiển thị lúc đăng nhập: nếu thành công thì sao, thất bại thì hiển thị những gì?
import React from 'react';
import { TaskProvider, useTasks } from './context/TaskContext';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import NotificationContainer from './components/NotificationContainer';

const AuthenticatedApp: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <Dashboard />
      </main>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useTasks();

  return isAuthenticated ? <AuthenticatedApp /> : <Login />;
};


const App: React.FC = () => {
  return (
    <TaskProvider>
      <AppContent />
      <NotificationContainer />
    </TaskProvider>
  );
};

export default App;
