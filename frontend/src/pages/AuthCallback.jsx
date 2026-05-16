import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import useAuthStore from '../store/authStore';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get('token');
      const errorParam = searchParams.get('error');

      if (errorParam) {
        setStatus('error');
        setError('Authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      if (!token) {
        setStatus('error');
        setError('No authentication token received.');
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      try {
        await login(token);
        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch (err) {
        setStatus('error');
        setError(err.message || 'Failed to authenticate');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleCallback();
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-12 max-w-md w-full text-center space-y-6">
        {status === 'loading' && (
          <>
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Authenticating...
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we sign you in
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Success!
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Redirecting to dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-600 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Authentication Failed
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {error}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Redirecting to login...
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;

// Made with Bob
