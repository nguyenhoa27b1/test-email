import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Task, Role, Status, Priority } from '../types';
import { useTasks } from '../context/TaskContext';
import TaskModal from './TaskModal';
import UserAvatar from './UserAvatar';

interface TaskCardProps {
  task: Task;
}

const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getDeadlineInfo = (deadline: Date, status: Status) => {
    if (status === Status.Done) {
        return {
            label: 'Task Completed',
            progress: 100,
            barColor: 'bg-green-500',
            textColor: 'text-green-600 dark:text-green-500',
        };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const deadlineDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
    
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return {
            label: `Overdue by ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'}`,
            progress: 100,
            barColor: 'bg-red-500',
            textColor: 'text-red-600 dark:text-red-500',
        };
    }
    if (diffDays === 0) {
        return {
            label: 'Due Today',
            progress: 90,
            barColor: 'bg-yellow-500',
            textColor: 'text-yellow-600 dark:text-yellow-500',
        };
    }
    if (diffDays <= 3) {
        return {
            label: `Due in ${diffDays} ${diffDays === 1 ? 'day' : 'days'}`,
            progress: 75,
            barColor: 'bg-yellow-400',
            textColor: 'text-yellow-600 dark:text-yellow-500',
        };
    }
    if (diffDays <= 7) {
        return {
            label: `Due in ${diffDays} days`,
            progress: 50,
            barColor: 'bg-green-400',
            textColor: 'text-gray-600 dark:text-gray-400',
        };
    }
    return {
        label: `Due in ${diffDays} days`,
        progress: 25,
        barColor: 'bg-green-500',
        textColor: 'text-gray-600 dark:text-gray-400',
    };
};

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
    const { users, currentUser, getUserById, updateTask } = useTasks();
    const [isEditing, setIsEditing] = useState(false);
    const [isTransferring, setIsTransferring] = useState(false);
    const [isScoreEditing, setIsScoreEditing] = useState(false);
    const [editableScore, setEditableScore] = useState(task.score?.toString() ?? '');
    
    const transferRef = useRef<HTMLDivElement>(null);
    const scoreInputRef = useRef<HTMLInputElement>(null);
    
    const assignee = useMemo(() => getUserById(task.assigneeId), [task.assigneeId, getUserById]);
    const deadlineInfo = getDeadlineInfo(task.deadline, task.status);

    const priorityInfo = useMemo(() => {
        switch (task.priority) {
            case Priority.High:
                return { text: 'High', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' };
            case Priority.Medium:
                return { text: 'Medium', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
            case Priority.Low:
                return { text: 'Low', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' };
            default:
                return { text: 'Medium', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' };
        }
    }, [task.priority]);


    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (transferRef.current && !transferRef.current.contains(event.target as Node)) {
                setIsTransferring(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isScoreEditing) {
            scoreInputRef.current?.focus();
            scoreInputRef.current?.select();
        }
    }, [isScoreEditing]);


    const handleStatusChange = (newStatus: Status) => {
        if (currentUser.role === Role.Admin || currentUser.id === task.assigneeId) {
            updateTask(task.id, { status: newStatus });
            // If an admin marks a task as done and it has no score,
            // automatically open the score editor.
            if (
                newStatus === Status.Done &&
                currentUser.role === Role.Admin &&
                task.score === undefined
            ) {
                setIsScoreEditing(true);
            }
        }
    };

    const handleTransfer = (newAssigneeId: string) => {
        const newAssignee = getUserById(newAssigneeId);
        if (!newAssignee) return;

        if (window.confirm(`Are you sure you want to transfer this task to ${newAssignee.name}?`)) {
            updateTask(task.id, { assigneeId: newAssigneeId });
        }
        setIsTransferring(false);
    };

    const handleScoreSave = () => {
        const newScore = parseInt(editableScore, 10);
        if (!isNaN(newScore) && newScore >= 0 && newScore <= 100) {
            updateTask(task.id, { score: newScore });
        } else {
            setEditableScore(task.score?.toString() ?? '');
        }
        setIsScoreEditing(false);
    };

    const handleScoreKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleScoreSave();
        } else if (e.key === 'Escape') {
            setEditableScore(task.score?.toString() ?? '');
            setIsScoreEditing(false);
        }
    };
    
    const isViewer = currentUser.role === Role.Viewer;
    const isAdmin = currentUser.role === Role.Admin;
    const canOpenModal = (isAdmin || currentUser.id === task.creatorId || currentUser.id === task.assigneeId) && !isViewer;
    const canTransfer = (isAdmin || currentUser.id === task.assigneeId) && !isViewer;
    
    const renderScore = () => {
        if (isAdmin && isScoreEditing) {
            return (
                <input
                    ref={scoreInputRef}
                    type="number"
                    min="0"
                    max="100"
                    value={editableScore}
                    onChange={(e) => setEditableScore(e.target.value)}
                    onBlur={handleScoreSave}
                    onKeyDown={handleScoreKeyDown}
                    className="w-24 text-center bg-white dark:bg-gray-800 border border-brand-primary rounded-lg text-sm font-bold text-gray-800 dark:text-white focus:ring-2 focus:ring-brand-primary focus:outline-none py-1"
                />
            );
        }

        if (task.score !== undefined) {
            const scoreElement = (
                <div className="bg-brand-secondary text-white text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                    {task.score}/100
                </div>
            );

            if (isAdmin) {
                return (
                    <button 
                        onClick={() => setIsScoreEditing(true)} 
                        className="hover:opacity-80 transition-opacity"
                        title="Edit Score"
                    >
                        {scoreElement}
                    </button>
                );
            }
            return scoreElement;
        }

        if (task.status === Status.Done) {
            if (isAdmin) {
                 return (
                    <button
                        onClick={() => setIsScoreEditing(true)}
                        className="bg-brand-primary hover:bg-indigo-700 text-white text-xs font-bold px-3 py-1 rounded-full flex-shrink-0 transition-colors"
                        title="Add Score"
                    >
                        Add Score
                    </button>
                );
            }
            return (
                <div className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs font-bold px-2 py-1 rounded-full flex-shrink-0">
                    Pending Score
                </div>
            );
        }
        
        return null;
    };


    return (
        <>
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-md p-4 border-l-4 border-brand-primary hover:shadow-lg transition-shadow duration-300 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-lg mb-1 text-gray-800 dark:text-white flex-1 pr-2">{task.title}</h3>
                        {renderScore()}
                    </div>
                     <div className="mb-2">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${priorityInfo.className}`}>
                            {priorityInfo.text}
                        </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 min-h-[40px]">{task.description}</p>
                </div>
                
                <div>
                    <div className="mt-2 text-xs">
                        <div className="flex justify-between items-baseline mb-1">
                            <span className={`font-semibold ${deadlineInfo.textColor}`}>{deadlineInfo.label}</span>
                            <span className="font-mono text-gray-500">{formatDate(task.deadline)}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div className={`${deadlineInfo.barColor} h-1.5 rounded-full transition-all duration-500 ease-out`} style={{ width: `${deadlineInfo.progress}%` }}></div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-sm mt-4">
                        <div className="flex items-center">
                            {assignee && <UserAvatar name={assignee.name} avatarUrl={assignee.avatarUrl} userId={assignee.id} size="md" className="border-2 border-white dark:border-gray-700" />}
                        </div>

                        <div className="flex items-center space-x-2">
                            {canTransfer && (
                                <div className="relative" ref={transferRef}>
                                    <button onClick={() => setIsTransferring(prev => !prev)} className="text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors" title="Transfer Task">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                          <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                                        </svg>
                                    </button>
                                    {isTransferring && (
                                        <div className="absolute bottom-full right-0 mb-2 w-56 bg-white dark:bg-dark-card rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10 origin-bottom-right animate-fade-in-up">
                                            <div className="p-2 text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">Transfer to...</div>
                                            <ul className="max-h-48 overflow-y-auto py-1">
                                                {users.filter(u => u.id !== task.assigneeId).length > 0 ? (
                                                    users.filter(u => u.id !== task.assigneeId).map(user => (
                                                    <li key={user.id}>
                                                        <button onClick={() => handleTransfer(user.id)} className="w-full text-left flex items-center p-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                            <UserAvatar name={user.name} avatarUrl={user.avatarUrl} userId={user.id} size="sm" className="mr-2" />
                                                            <span className="text-gray-800 dark:text-gray-200">{user.name}</span>
                                                        </button>
                                                    </li>
                                                ))
                                                ) : (
                                                    <li className="p-2 text-center text-xs text-gray-500">No other users available.</li>
                                                )}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                             {canOpenModal && (
                                 <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-brand-primary dark:hover:text-brand-primary transition-colors" title="Edit Task">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                    </svg>
                                </button>
                             )}
                             <div className="relative">
                                <select 
                                    value={task.status} 
                                    onChange={(e) => handleStatusChange(e.target.value as Status)} 
                                    disabled={!canTransfer}
                                    className={`text-xs appearance-none bg-gray-100 dark:bg-gray-700 border border-transparent rounded-md py-1 pl-2 pr-7 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-primary ${!canTransfer ? 'cursor-not-allowed opacity-70' : ''}`}
                                >
                                    {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <svg className="w-4 h-4 absolute top-1/2 right-1.5 -translate-y-1/2 pointer-events-none text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
            {isEditing && <TaskModal taskToEdit={task} onClose={() => setIsEditing(false)} />}
        </>
    );
};

export default TaskCard;