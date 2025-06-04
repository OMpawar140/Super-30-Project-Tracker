import React, { useState  } from 'react';
import {useNavigate } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { HiMail, HiLockClosed } from 'react-icons/hi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

type AuthMode = 'login' | 'register';

const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Add your authentication logic here  
    navigate('/dashboard');
    setTimeout(() => setIsLoading(false), 1000);
  
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-md">
        <Card variant="hover" className="overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {mode === 'login' ? 'Welcome back!' : 'Create an account'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {mode === 'login'
                  ? 'Sign in to continue to your account'
                  : 'Get started with your free account'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
                icon={<HiMail className="w-5 h-5" />}
                required
              />

              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                icon={<HiLockClosed className="w-5 h-5" />}
                required
              />

              {mode === 'register' && (
                <Input
                  type="password"
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  icon={<HiLockClosed className="w-5 h-5" />}
                  required
                />
              )}

              <Button type="submit" fullWidth isLoading={isLoading}>
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  type="button"
                  className="flex items-center justify-center"
                >
                  <FcGoogle className="w-5 h-5 mr-2" />
                  Google
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="flex items-center justify-center"
                >
                  <FaGithub className="w-5 h-5 mr-2" />
                  GitHub
                </Button>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage; 