import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { User, Task, Role, Status } from '../types';
import { USERS, TASKS } from '../constants';
import { sendReminderEmail } from '../utils/emailService';

export interface NotificationType {
  id: string;
  message: string;
  type: 'success' | 'reminder';
}

interface TaskContextType {
  users: User[];
  tasks: Task[];
  currentUser: User | null;
  isAuthenticated: boolean;
  notifications: NotificationType[];
  login: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (credential: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string, role: Role) => Promise<boolean>;
  logout: () => void;
  addTask: (task: Omit<Task, 'id' | 'status' | 'creatorId'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  getUserById: (userId: string) => User | undefined;
  updateUser: (userId: string, updates: Partial<Omit<User, 'id'>>) => void;
  deleteUser: (userId: string) => void;
  removeNotification: (id: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(USERS);
  const [tasks, setTasks] = useState<Task[]>(TASKS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

  // State to track which reminders have been sent to avoid spamming users
  const [sentReminders, setSentReminders] = useState<{ [key: string]: string[] }>(() => {
    try {
      const saved = localStorage.getItem('sentReminders');
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
        console.error("Failed to parse sentReminders from localStorage", error);
        return {};
    }
  });

  // Persist sent reminder logs to localStorage
  useEffect(() => {
    localStorage.setItem('sentReminders', JSON.stringify(sentReminders));
  }, [sentReminders]);


  const addNotification = useCallback((message: string, type: NotificationType['type']) => {
    const id = `notif-${Date.now()}-${Math.random()}`;
    setNotifications(prev => [...prev, { id, message, type }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, [users]);

  const loginWithGoogle = useCallback(async (credential: string): Promise<boolean> => {
    try {
      // Securely verify the token with the backend.
      const backendResponse = await fetch('http://localhost:5001/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: credential }),
      });

      if (!backendResponse.ok) {
          const errorData = await backendResponse.json();
          console.error("Backend token verification failed:", errorData.message);
          addNotification(errorData.message || 'Google Sign-In failed.', 'reminder');
          return false;
      }
      
      const { user: verifiedUser } = await backendResponse.json();
      if (!verifiedUser || !verifiedUser.email) {
          console.error("Backend did not return a valid user.");
          addNotification('Google Sign-In failed: Invalid user data from server.', 'reminder');
          return false;
      }
      
      const { email, name, picture } = verifiedUser;
      
      const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (existingUser) {
          // Log in the existing user, and update their details from Google profile
          const updatedUser = { ...existingUser, name, avatarUrl: picture };
          setUsers(prev => prev.map(u => u.id === existingUser.id ? updatedUser : u));
          setCurrentUser(updatedUser);
          setIsAuthenticated(true);
          addNotification(`Welcome back, ${name}!`, 'success');
          return true;
      } else {
          // Create a new user for the Google account
          const userId = `user-${Date.now()}`;
          const newUser: User = {
              id: userId,
              name,
              email,
              role: Role.User, // Default role for new Google sign-ups
              avatarUrl: picture,
              // No password for Google users
          };
          setUsers(prev => [...prev, newUser]);
          setCurrentUser(newUser);
          setIsAuthenticated(true);
          addNotification('Account created successfully! Welcome.', 'success');
          return true;
      }
    } catch (error) {
      console.error("Error during Google Sign-In:", error);
      addNotification('An error occurred during Google Sign-In.', 'reminder');
      return false;
    }
  }, [users, addNotification]);


  const signup = useCallback(async (name: string, email: string, password: string, role: Role): Promise<boolean> => {
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return false; // User already exists
    }
    const userId = `user-${Date.now()}`;
    const newUser: User = {
      id: userId,
      name,
      email,
      password,
      role,
      avatarUrl: `https://i.pravatar.cc/150?u=${userId}`,
    };
    setUsers(prev => [...prev, newUser]);
    addNotification('Account created successfully! Welcome.', 'success');
    
    // Auto-login by setting state directly
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    return true;
  }, [users, addNotification]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, []);
  
  const getUserById = useCallback((userId: string) => {
    return users.find(u => u.id === userId);
  }, [users]);

  const addTask = (taskData: Omit<Task, 'id' | 'status' | 'creatorId'>) => {
    if (!currentUser) return;
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      status: Status.ToDo,
      creatorId: currentUser.id,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
    addNotification(`Task "${newTask.title}" created.`, 'success');

    // After creating the task, send a notification email to the assignee.
    fetch('http://localhost:5001/api/notifications/task-change', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        task: newTask,
        recipientId: newTask.assigneeId,
        action: 'assigned', // The action for a new task is 'assigned'
      }),
    })
    .then(async response => {
      if (response.ok) {
        const data = await response.json();
        console.log('Notification API call successful:', data.message);
        addNotification('Assignment notification sent.', 'success');
      } else {
        const errorData = await response.json();
        console.error('Failed to send task assignment notification:', errorData.message);
        addNotification(`Failed to send notification: ${errorData.message}`, 'reminder');
      }
    })
    .catch(error => {
      console.error('Error sending task assignment notification:', error);
      addNotification('Network error while sending notification.', 'reminder');
    });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const updateUser = (userId: string, updates: Partial<Omit<User, 'id'>>) => {
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, ...updates } : user
      )
    );
  };

  const deleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
        addNotification("You cannot delete yourself.", 'reminder');
        return;
    }
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;
    const admins = users.filter(u => u.role === Role.Admin);
    if (admins.length === 1 && userToDelete.role === Role.Admin) {
        addNotification("You cannot delete the last admin user.", 'reminder');
        return;
    }
    const hasTasks = tasks.some(task => task.assigneeId === userId || task.creatorId === userId);
    if (hasTasks) {
        addNotification("Cannot delete user. Reassign their tasks first.", 'reminder');
        return;
    }
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    addNotification(`User ${userToDelete.name} has been deleted.`, 'success');
  };
  
  // --- Deadline Email Reminder Effect ---
  useEffect(() => {
    const checkDeadlines = () => {
        if (!isAuthenticated) return;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        
        const remindersToLog: { taskId: string, reminderType: string }[] = [];
        const emailsToSend: Promise<void>[] = [];

        tasks.forEach(task => {
            if (task.status === Status.Done) return;
            
            const assignee = getUserById(task.assigneeId);
            if (!assignee || !assignee.email) return;

            const deadlineDate = new Date(task.deadline);
            deadlineDate.setHours(0, 0, 0, 0);

            const diffTime = deadlineDate.getTime() - today.getTime();
            const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

            const alreadySentReminders = sentReminders[task.id] || [];

            let reminderType: string | null = null;
            let subject = '';
            let body = '';
            
            if (diffDays < 0) {
                reminderType = `overdue-${todayStr}`;
                if (!alreadySentReminders.includes(reminderType)) {
                    subject = `OVERDUE: Task "${task.title}"`;
                    body = `This is a daily reminder that your task "${task.title}" was due on ${task.deadline.toLocaleDateString()}. Please update its status as soon as possible.`;
                }
            } else if (diffDays === 1) {
                reminderType = 'dueIn1';
                 if (!alreadySentReminders.includes(reminderType)) {
                    subject = `Reminder: Task "${task.title}" is due tomorrow`;
                    body = `This is a friendly reminder that your task "${task.title}" is due tomorrow, ${task.deadline.toLocaleDateString()}.`;
                }
            } else if (diffDays === 3) {
                reminderType = 'dueIn3';
                 if (!alreadySentReminders.includes(reminderType)) {
                    subject = `Reminder: Task "${task.title}" is due in 3 days`;
                    body = `This is a friendly reminder that your task "${task.title}" is due in 3 days, on ${task.deadline.toLocaleDateString()}.`;
                }
            }

            if (reminderType && subject && body) {
                const fullBody = `Hi ${assignee.name},\n\n${body}\n\nThanks,\nTeam Task Manager`;
                emailsToSend.push(sendReminderEmail({
                    to_name: assignee.name,
                    to_email: assignee.email,
                    subject,
                    body: fullBody,
                }));
                remindersToLog.push({ taskId: task.id, reminderType });
            }
        });

        if (emailsToSend.length > 0) {
            Promise.all(emailsToSend).then(() => {
                setSentReminders(prevSentReminders => {
                    const updatedSentReminders = { ...prevSentReminders };
                    remindersToLog.forEach(({ taskId, reminderType }) => {
                        const taskReminders = updatedSentReminders[taskId] || [];
                        if (!taskReminders.includes(reminderType)) {
                            updatedSentReminders[taskId] = [...taskReminders, reminderType];
                        }
                    });
                    return updatedSentReminders;
                });
            });
        }
    };
    
    const timeoutId = setTimeout(checkDeadlines, 2000); 
    const intervalId = setInterval(checkDeadlines, 60000);

    return () => {
        clearTimeout(timeoutId);
        clearInterval(intervalId);
    };
  }, [tasks, isAuthenticated, getUserById, sentReminders]);


  const value = {
    users,
    tasks,
    currentUser,
    isAuthenticated,
    notifications,
    login,
    loginWithGoogle,
    signup,
    logout,
    addTask,
    updateTask,
    getUserById,
    updateUser,
    deleteUser,
    removeNotification,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
