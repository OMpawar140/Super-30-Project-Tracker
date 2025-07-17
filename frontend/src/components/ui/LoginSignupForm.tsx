import React, { useEffect, useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiService, useApiCall } from '../../services/api';

// Mock auth context for demo purposes
interface LoginSignupFormProps {
  onSuccess?: () => void;
}

const LoginSignupForm: React.FC<LoginSignupFormProps> = ({ onSuccess }) => {
  const { callApi } = useApiCall();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
    confirmPassword: ''
  });

  const { login, signup, loginWithGoogle, resetPassword } = useAuth();

  useEffect(() => {
    document.title = "Project Tracker";
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

const handleRegisterEmail = async (email?: string) => {
  try {
    await callApi(() => apiService.auth.emailRegister(email || formData.email));
    setSuccess('Email registered successfully!');
  } catch (err) {
    console.error('Email already present', err);
  }
};

  const syncUserWithBackend = async () => {
    try {
      // The auth token is automatically attached by your apiService
      await callApi(() => apiService.auth.verifyToken());
      console.log('User synced with backend successfully.');
    } catch (err) {
      // We can ignore conflicts (user already exists), but log other errors
      // This check might need adjustment based on your apiService error handling
      if ((err as any)?.response?.status !== 409) {
        console.error('Failed to sync user with backend:', err);
        // Optionally, set an error state to inform the user
        // setError('Could not sync your account. Please try again.');
      }
    }
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!isLogin) {
      if (!formData.displayName) {
        setError('Display name is required for signup');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        await syncUserWithBackend(); // Sync after login
        setSuccess('Successfully logged in!');
      } else {
        await signup(formData.email, formData.password, formData.displayName);
        await syncUserWithBackend(); // Sync after signup
        setSuccess('Account created successfully!');
      }
      
      // Clear form
      setFormData({
        email: '',
        password: '',
        displayName: '',
        confirmPassword: ''
      });
      
      onSuccess?.();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

const handleGoogleSignIn = async () => {
  setLoading(true);
  setError('');
  
  try {
    const user = await loginWithGoogle();
    await syncUserWithBackend(); // Sync after Google sign-in
    setSuccess('Successfully signed in with Google!');
    onSuccess?.();
    const email = user?.email || formData.email;
    if (email) {
      await handleRegisterEmail(email);
    }
    onSuccess?.();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    setError(err.message || 'Google sign-in failed');
  } finally {
    setLoading(false);
  }
};

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await resetPassword(formData.email);
      setSuccess('Password reset email sent! Check your inbox.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
              <Lock className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                }}
                className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors cursor-pointer"
              >
                {isLogin ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          {/* Error and Success Messages */}
          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          {/* Form */}
          <div className="mt-8 space-y-6">
            <div className="space-y-4">
              {/* Display Name (Signup only) */}
              {!isLogin && (
                <div>
                  <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Enter your full name"
                      required={!isLogin}
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your email address"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none relative block w-full pl-10 pr-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Signup only) */}
              {!isLogin && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="appearance-none relative block w-full pl-10 pr-12 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Confirm your password"
                      required={!isLogin}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Forgot Password (Login only) */}
            {isLogin && (
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-indigo-600 hover:text-indigo-500 transition-colors hover:cursor-pointer hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285f4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34a853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#fbbc05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#ea4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                {loading ? 'Signing in...' : 'Continue with Google'}
              </button>
            </div>
          </div>
        </div>

        {/* Terms and Privacy */}
        <div className="text-center">
          <p className="text-xs text-gray-600">
            By continuing, you agree to our{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-indigo-600 hover:text-indigo-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginSignupForm;