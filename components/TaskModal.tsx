
import React, { useState, useMemo } from 'react';
import { useTasks } from '../context/TaskContext';
import { Task, Role, Status, User, Priority } from '../types';
import UserAvatar from './UserAvatar';

interface TaskModalProps {
  onClose: () => void;
  taskToEdit?: Task;
}

const TaskModal: React.FC<TaskModalProps> = ({ onClose, taskToEdit }) => {
  const { users, currentUser, addTask, updateTask, getUserById } = useTasks();

  if (!currentUser) return null;

  const [title, setTitle] = useState(taskToEdit?.title || '');
  const [description, setDescription] = useState(taskToEdit?.description || '');
  const [assigneeId, setAssigneeId] = useState(taskToEdit?.assigneeId || currentUser.id);
  const [priority, setPriority] = useState<Priority>(taskToEdit?.priority || Priority.Medium);
  
  const today = new Date().toISOString().split('T')[0];
  const [deadline, setDeadline] = useState(taskToEdit?.deadline.toISOString().split('T')[0] || today);
  
  const [score, setScore] = useState(taskToEdit?.score?.toString() || '');
  const [status, setStatus] = useState(taskToEdit?.status || Status.ToDo);
  
  const isCreating = !taskToEdit;
  const isViewer = currentUser.role === Role.Viewer;
  const isAdmin = currentUser.role === Role.Admin;
  const isCreator = taskToEdit?.creatorId === currentUser.id;
  const isAssignee = taskToEdit?.assigneeId === currentUser.id;

  const canEditDetails = (isAdmin || isCreating || isCreator) && !isViewer;
  const canChangeAssignee = (isAdmin || (!!taskToEdit && isAssignee)) && !isViewer;
  
  const assigneeOptions = useMemo(() => {
    if (isAdmin || canChangeAssignee) {
      return users;
    }
    return [currentUser];
  }, [isAdmin, canChangeAssignee, users, currentUser]);
  
  const currentAssignee = useMemo(() => getUserById(assigneeId), [assigneeId, getUserById]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !assigneeId || !deadline || !priority || isViewer) return;

    const taskData = {
      title,
      description,
      assigneeId,
      deadline: new Date(`${deadline}T00:00:00`),
      priority,
    };

    if (taskToEdit) {
        const updates: Partial<Task> = { ...taskData };
        if(isAdmin) {
            updates.score = score ? Number(score) : undefined;
            updates.status = status;
        }
        updateTask(taskToEdit.id, updates);
    } else {
        addTask(taskData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-dark-card rounded-lg p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">{taskToEdit ? (isViewer ? 'View Task' : 'Edit Task') : 'Create New Task'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              readOnly={!canEditDetails}
              required
              className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring-brand-primary ${!canEditDetails ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'bg-gray-50 dark:bg-gray-700'}`}
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              readOnly={!canEditDetails}
              required
              className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring-brand-primary ${!canEditDetails ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'bg-gray-50 dark:bg-gray-700'}`}
            />
          </div>
          <div>
            <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assign To</label>
            {(isCreating && !isAdmin) || !canChangeAssignee ? (
              <div className="mt-1 flex items-center space-x-3 bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                {currentAssignee && <UserAvatar name={currentAssignee.name} avatarUrl={currentAssignee.avatarUrl} userId={currentAssignee.id} size="md" />}
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{currentAssignee?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{currentAssignee?.role}</p>
                </div>
              </div>
            ) : (
               <select
                id="assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                required
                disabled={!canChangeAssignee}
                className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring-brand-primary ${!canChangeAssignee ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'bg-gray-50 dark:bg-gray-700'}`}
              >
                {assigneeOptions.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                ))}
              </select>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Deadline</label>
              <input
                type="date"
                id="deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                min={isAdmin || isCreating ? today : undefined}
                readOnly={!canEditDetails}
                required
                className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring-brand-primary ${!canEditDetails ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'bg-gray-50 dark:bg-gray-700'}`}
              />
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                disabled={!canEditDetails}
                required
                className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring-brand-primary ${!canEditDetails ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'bg-gray-50 dark:bg-gray-700'}`}
              >
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {taskToEdit && isAdmin && (
            <>
              <hr className="my-6 border-gray-200 dark:border-gray-700" />
              <h3 className="text-lg font-semibold">Admin Controls</h3>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <select id="status" value={status} onChange={(e) => setStatus(e.target.value as Status)} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring-brand-primary bg-gray-50 dark:bg-gray-700">
                    {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="score" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Score (0-100)</label>
                <input
                  type="number"
                  id="score"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  min="0"
                  max="100"
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring-brand-primary bg-gray-50 dark:bg-gray-700"
                />
              </div>
            </>
          )}

          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
              {isViewer ? 'Close' : 'Cancel'}
            </button>
            {!isViewer && (
                <button type="submit" className="bg-brand-primary hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                  {taskToEdit ? 'Save Changes' : 'Create Task'}
                </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
