
import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { User, Role } from '../types';

interface UserEditModalProps {
  onClose: () => void;
  userToEdit: User;
}

const UserEditModal: React.FC<UserEditModalProps> = ({ onClose, userToEdit }) => {
  const { updateUser } = useTasks();

  const [name, setName] = useState(userToEdit.name);
  const [email, setEmail] = useState(userToEdit.email);
  const [role, setRole] = useState<Role>(userToEdit.role);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    updateUser(userToEdit.id, { name, role, email });
    onClose();
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[60] p-4">
      <div className="bg-white dark:bg-dark-card rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6">Edit User</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring-brand-primary bg-gray-50 dark:bg-gray-700"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              readOnly
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring-brand-primary bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-brand-primary focus:ring-brand-primary bg-gray-50 dark:bg-gray-700"
            >
              {Object.values(Role).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-brand-primary hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserEditModal;
