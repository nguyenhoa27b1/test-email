//Bảng quản lý công việc
import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { Task, Status, Role } from '../types';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import UserListModal from './UserListModal';

const TaskColumn: React.FC<{ title: string; tasks: Task[]; className: string }> = ({ title, tasks, className }) => (
  <div className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 flex-shrink-0 w-80">
    <div className={`flex items-center mb-4 pb-2 border-b-4 ${className}`}>
        <h2 className="font-bold text-lg text-gray-800 dark:text-gray-100">{title}</h2>
        <span className="ml-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm font-semibold px-2.5 py-0.5 rounded-full">{tasks.length}</span>
    </div>
    <div className="space-y-4 overflow-y-auto h-[calc(100vh-25rem)] pr-2">
      {tasks.length > 0 ? tasks.map(task => <TaskCard key={task.id} task={task} />) : <p className="text-center text-gray-500 mt-8">No tasks match the current filters.</p>}
    </div>
  </div>
);


const Dashboard: React.FC = () => {
  const { tasks, users, currentUser } = useTasks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [creatorFilter, setCreatorFilter] = useState('all');
  const [deadlineFilter, setDeadlineFilter] = useState('all');

  const myTasks = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === Role.Admin || currentUser.role === Role.Viewer) return tasks;
    return tasks.filter(task => task.assigneeId === currentUser.id || task.creatorId === currentUser.id);
  }, [tasks, currentUser]);

  const filteredTasks = useMemo(() => {
    let result = myTasks;

    // Search filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      result = result.filter(task => 
        task.title.toLowerCase().includes(lowercasedQuery) || 
        task.description.toLowerCase().includes(lowercasedQuery)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(task => task.status === statusFilter);
    }

    // Assignee filter
    if (assigneeFilter !== 'all') {
      result = result.filter(task => task.assigneeId === assigneeFilter);
    }

    // Creator filter
    if (creatorFilter !== 'all') {
        result = result.filter(task => task.creatorId === creatorFilter);
    }

    // Deadline filter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (deadlineFilter === 'today') {
        result = result.filter(task => {
            const deadlineDate = new Date(task.deadline.getFullYear(), task.deadline.getMonth(), task.deadline.getDate());
            return deadlineDate.getTime() === today.getTime();
        });
    } else if (deadlineFilter === 'this-week') {
        const oneWeekFromNow = new Date(today);
        oneWeekFromNow.setDate(today.getDate() + 7);
        result = result.filter(task => task.deadline >= today && task.deadline <= oneWeekFromNow);
    } else if (deadlineFilter === 'overdue') {
        result = result.filter(task => now > task.deadline && task.status !== Status.Done);
    }

    return result;
  }, [myTasks, searchQuery, statusFilter, assigneeFilter, creatorFilter, deadlineFilter]);

  const { toDo, inProgress, overdue, done } = useMemo(() => {
    const isOverdue = (task: Task) => new Date() > task.deadline && task.status !== Status.Done;
    
    return {
      toDo: filteredTasks.filter(t => t.status === Status.ToDo && !isOverdue(t)),
      inProgress: filteredTasks.filter(t => t.status === Status.InProgress && !isOverdue(t)),
      overdue: filteredTasks.filter(t => isOverdue(t)),
      done: filteredTasks.filter(t => t.status === Status.Done),
    };
  }, [filteredTasks]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setAssigneeFilter('all');
    setCreatorFilter('all');
    setDeadlineFilter('all');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h1 className="text-3xl font-bold">Task Board</h1>
        <div className="flex items-center space-x-2">
          {currentUser?.role === Role.Admin && (
            <button
              onClick={() => setIsUserModalOpen(true)}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0110 14.07a3.001 3.001 0 01-2.83-2.017A5 5 0 013 12a5 5 0 01-2.89-4.33A6.97 6.97 0 000 16c0 .34.024.673.07 1h12.86z" /></svg>
              <span>Manage Users</span>
            </button>
          )}
          {currentUser?.role !== Role.Viewer && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-brand-primary hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
              <span>Create Task</span>
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white dark:bg-dark-card rounded-lg shadow items-end">
        <div className="w-full">
          <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Search Tasks</label>
          <input
            type="text"
            id="search-filter"
            placeholder="Search by title or description..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring-brand-primary bg-gray-50 dark:bg-gray-700 py-2 px-3"
          />
        </div>
        <div className="flex-grow">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
          <select id="status-filter" value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring-brand-primary bg-gray-50 dark:bg-gray-700 py-2 px-3">
            <option value="all">All Statuses</option>
            {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex-grow">
          <label htmlFor="assignee-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assignee</label>
          <select id="assignee-filter" value={assigneeFilter} onChange={e => setAssigneeFilter(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring-brand-primary bg-gray-50 dark:bg-gray-700 py-2 px-3">
            <option value="all">All Assignees</option>
            {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
        </div>
        <div className="flex-grow">
          <label htmlFor="creator-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Creator</label>
          <select id="creator-filter" value={creatorFilter} onChange={e => setCreatorFilter(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring-brand-primary bg-gray-50 dark:bg-gray-700 py-2 px-3">
            <option value="all">All Creators</option>
            {users.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
          </select>
        </div>
        <div className="flex-grow">
          <label htmlFor="deadline-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</label>
          <select id="deadline-filter" value={deadlineFilter} onChange={e => setDeadlineFilter(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring-brand-primary bg-gray-50 dark:bg-gray-700 py-2 px-3">
            <option value="all">Any Time</option>
            <option value="today">Due Today</option>
            <option value="this-week">Due This Week</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        <button onClick={handleResetFilters} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
          Reset Filters
        </button>
      </div>

      <div className="flex-grow flex space-x-6 overflow-x-auto pb-4">
        <TaskColumn title="To Do" tasks={toDo} className="border-blue-500" />
        <TaskColumn title="In Progress" tasks={inProgress} className="border-yellow-500" />
        <TaskColumn title="Overdue" tasks={overdue} className="border-red-500" />
        <TaskColumn title="Done" tasks={done} className="border-green-500" />
      </div>

      {isModalOpen && <TaskModal onClose={() => setIsModalOpen(false)} />}
      {isUserModalOpen && <UserListModal onClose={() => setIsUserModalOpen(false)} />}

    </div>
  );
};

export default Dashboard;