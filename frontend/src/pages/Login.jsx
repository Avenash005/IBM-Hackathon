import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Github, Zap, Shield, TrendingUp, Code } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Login = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGitHubLogin = () => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/github`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              PR Buddy
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Features */}
          <div className="space-y-8">
            <div>
              <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
                AI-Powered
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Code Reviews
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Automated pull request reviews using IBM Bob AI. Catch bugs, security issues, and improve code quality instantly.
              </p>
            </div>

            <div className="space-y-4">
              <Feature
                icon={<Zap className="w-5 h-5" />}
                title="Lightning Fast"
                description="Reviews complete in under 60 seconds"
              />
              <Feature
                icon={<Shield className="w-5 h-5" />}
                title="Security First"
                description="Detect vulnerabilities and security issues automatically"
              />
              <Feature
                icon={<TrendingUp className="w-5 h-5" />}
                title="Quality Insights"
                description="Track code quality trends and improvements over time"
              />
              <Feature
                icon={<Code className="w-5 h-5" />}
                title="Smart Suggestions"
                description="Get actionable fixes with one-click acceptance"
              />
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Powered by IBM Bob AI</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome Back
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Sign in to access your PR reviews
              </p>
            </div>

            <button
              onClick={handleGitHubLogin}
              className="w-full flex items-center justify-center gap-3 bg-gray-900 dark:bg-gray-700 hover:bg-gray-800 dark:hover:bg-gray-600 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Github className="w-6 h-6" />
              <span>Continue with GitHub</span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Secure OAuth 2.0 Authentication
                </span>
              </div>
            </div>

            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
              <p className="text-center">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-300 font-medium mb-2">
                  🔒 What we access:
                </p>
                <ul className="space-y-1 text-blue-700 dark:text-blue-400 text-xs">
                  <li>• Your public profile information</li>
                  <li>• Repository access for PR reviews</li>
                  <li>• Ability to post review comments</li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
                <span>✓ No credit card required</span>
                <span>✓ Free tier available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 p-6">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© 2024 PR Buddy. Built for IBM Hackathon.</p>
        </div>
      </footer>
    </div>
  );
};

const Feature = ({ icon, title, description }) => (
  <div className="flex items-start gap-3">
    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

export default Login;

// Made with Bob
