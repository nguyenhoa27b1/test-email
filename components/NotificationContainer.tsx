
import React from 'react';
import { useTasks } from '../context/TaskContext';
import Notification from './Notification';

const NotificationContainer: React.FC = () => {
  const { notifications, removeNotification } = useTasks();

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-[100]" aria-live="polite" aria-atomic="true">
        {notifications.map(notif => (
          <Notification 
            key={notif.id} 
            message={notif.message} 
            type={notif.type}
            onClose={() => removeNotification(notif.id)} 
          />
        ))}
    </div>
  );
};

export default NotificationContainer;
