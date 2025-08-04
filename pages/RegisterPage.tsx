import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const _navigate = useNavigate(); // Renamed 'navigate' to '_navigate' to mark as unused

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    const { success, error: authError } = await auth.register(name, email, password);
    setIsLoading(false);
    if (success) {
      setSuccessMessage('Registration successful! Please check your email for a confirmation link to complete the process.');
      // Don't navigate away, let the user see the success message.
    } else {
      setError(authError || 'Registration failed. Please try again.');
    }
  };

  if (successMessage) {
    return (
        <div className="space-y-4 text-center">
            <h2 className="text-2xl font-semibold text-green-700">Success!</h2>
            <p className="text-textPrimary">{successMessage}</p>
            <p className="text-sm text-textSecondary">
                Once confirmed, you can{' '}
                <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                Sign in
                </Link>
                .
            </p>
        </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center text-textPrimary">Create Your Account</h2>
      {error && <p className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-textSecondary">Full Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="Your Name"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-textSecondary">Email Address</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-textSecondary">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6} // Basic validation
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-textSecondary">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
            placeholder="••••••••"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </div>
      </form>
      <p className="text-sm text-center text-textSecondary">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default RegisterPage;