import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTasks } from '../context/TaskContext';
import { Role } from '../types';

// Global types for Google Identity Services are defined in `google.d.ts`.

const Login: React.FC = () => {
  const { login, signup, loginWithGoogle, isAuthenticated } = useTasks();
  const [isLoginView, setIsLoginView] = useState(true);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(Role.User);
  const googleButtonRef = useRef<HTMLDivElement>(null);


  const handleGoogleCallback = useCallback(async (response: CredentialResponse) => {
    if (!response.credential) {
        setError("Google Sign-In failed. No credential returned.");
        return;
    }
    const success = await loginWithGoogle(response.credential);
    if (!success) {
      setError("Google Sign-In failed. Please try again.");
    }
  }, [loginWithGoogle]);
  
  useEffect(() => {
    if (isAuthenticated || typeof window.google?.accounts?.id === 'undefined' || !googleButtonRef.current) {
      return; // Exit if user is logged in, script not loaded, or container not ready.
    }

    // Initialize the Google client. This is safe to call multiple times.
    window.google.accounts.id.initialize({
        client_id: "336585363991-l2l242dr3c5h2ksv3kg0l2ln6v2ej7tr.apps.googleusercontent.com", 
        callback: handleGoogleCallback,
        ux_mode: 'popup',
    });

    // To prevent duplicate buttons on re-renders, we clear the container first.
    googleButtonRef.current.innerHTML = '';

    // Render the Google Sign-In button.
    window.google.accounts.id.renderButton(googleButtonRef.current, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'signin_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: '280'
    });
  }, [isAuthenticated, handleGoogleCallback]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    let success = false;
    if (isLoginView) {
      if (!email || !password) {
        setError('Please enter both email and password.');
        return;
      }
      success = await login(email, password);
      if (!success) {
        setError('Invalid email or password.');
      }
    } else {
      if (!name || !email || !password) {
        setError('Please fill out all fields.');
        return;
      }
      success = await signup(name, email, password, role);
      if (!success) {
        setError('An account with this email already exists.');
      }
    }
  };

  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
    setRole(Role.User);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand-primary mx-auto" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            {isLoginView ? 'Welcome Back!' : 'Create an account'}
          </h2>
        </div>
        
        <div className="bg-white dark:bg-dark-card p-8 rounded-lg shadow-lg">
            <div className="flex flex-col items-center justify-center mb-6">
                 <div ref={googleButtonRef} id="google-signin-button"></div>
            </div>
            
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              <span className="flex-shrink mx-4 text-xs text-gray-400 dark:text-gray-500 uppercase">{isLoginView ? 'Or sign in with email' : 'Or sign up with email'}</span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>

            <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">
                {!isLoginView && (
                  <div>
                    <label htmlFor="name" className="sr-only">Full Name</label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required={!isLoginView}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                      placeholder="Full Name"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="email-address" className="sr-only">Email address</label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 ${isLoginView ? 'rounded-t-md' : ''} focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm`}
                    placeholder="Email address"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isLoginView ? "current-password" : "new-password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 ${isLoginView ? 'rounded-b-md' : ''} focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm`}
                    placeholder="Password"
                  />
                </div>
                {!isLoginView && (
                    <div>
                        <label htmlFor="role" className="sr-only">Role</label>
                        <select
                            id="role"
                            name="role"
                            required
                            value={role}
                            onChange={(e) => setRole(e.target.value as Role)}
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 text-gray-900 dark:text-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-brand-primary focus:border-brand-primary focus:z-10 sm:text-sm"
                        >
                          {Object.values(Role).map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                    </div>
                )}
              </div>

              {error && <p className="text-sm text-red-600 text-center">{error}</p>}

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary"
                >
                  {isLoginView ? 'Sign in' : 'Sign up'}
                </button>
              </div>
            </form>
        </div>
         <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            {isLoginView ? "Don't have an account? " : "Already have an account? "}
            <button onClick={toggleView} className="font-medium text-brand-primary hover:text-indigo-500">
              {isLoginView ? 'Sign up' : 'Sign in'}
            </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
