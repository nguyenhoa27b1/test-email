
import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { User, Role } from '../types';
import UserEditModal from './UserEditModal';
import UserAvatar from './UserAvatar';

interface UserListModalProps {
  onClose: () => void;
}

const UserListModal: React.FC<UserListModalProps> = ({ onClose }) => {
  const { users, deleteUser } = useTasks();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleDelete = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      deleteUser(userId);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
        <div className="bg-white dark:bg-dark-card rounded-lg p-8 w-full max-w-2xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Manage Users</h2>
          </div>
          <div className="flex-grow overflow-y-auto pr-2">
            <ul className="space-y-3">
              {users.map(user => (
                <li key={user.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <UserAvatar name={user.name} avatarUrl={user.avatarUrl} userId={user.id} size="lg" />
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{user.name}</p>
                       <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                      <p className={`text-sm ${user.role === Role.Admin ? 'text-brand-primary' : 'text-brand-secondary'}`}>{user.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button onClick={() => handleEdit(user)} className="text-gray-500 hover:text-brand-primary dark:hover:text-brand-primary transition-colors" title="Edit User">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                    </button>
                    <button onClick={() => handleDelete(user.id)} className="text-gray-500 hover:text-red-500 dark:hover:text-red-500 transition-colors" title="Delete User">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex justify-end pt-6">
             <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
      {isEditModalOpen && selectedUser && <UserEditModal userToEdit={selectedUser} onClose={() => setIsEditModalOpen(false)} />}
    </>
  );
};

export default UserListModal;
