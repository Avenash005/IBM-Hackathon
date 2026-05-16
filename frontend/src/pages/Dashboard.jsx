import { useState, useEffect } from 'react';
import { reviewsAPI } from '../services/api';
import { AlertCircle, CheckCircle, AlertTriangle, Bug, Lock, Palette, Lightbulb, RefreshCw, ExternalLink } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reReviewing, setReReviewing] = useState({});

  useEffect(() => {
    fetchReviews();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchReviews, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchReviews = async () => {
    try {
      const result = await reviewsAPI.getReviews();
      setData(result);
      setError(null);
    } catch (err) {
      setError('Failed to fetch reviews');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReReview = async (review) => {
    const key = `${review.owner}/${review.repo}/${review.pullNumber}`;
    setReReviewing(prev => ({ ...prev, [key]: true }));

    try {
      await reviewsAPI.triggerReview(review.owner, review.repo, review.pullNumber);
      // Wait a bit then refresh
      setTimeout(fetchReviews, 3000);
    } catch (err) {
      console.error('Re-review failed:', err);
    } finally {
      setTimeout(() => {
        setReReviewing(prev => ({ ...prev, [key]: false }));
      }, 3000);
    }
  };

  const getRiskColor = (level) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[level] || colors.low;
  };

  const getRiskIcon = (level) => {
    const icons = {
      low: <CheckCircle className="w-5 h-5" />,
      medium: <AlertTriangle className="w-5 h-5" />,
      high: <AlertCircle className="w-5 h-5" />
    };
    return icons[level] || icons.low;
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      bug: <Bug className="w-4 h-4" />,
      security: <Lock className="w-4 h-4" />,
      style: <Palette className="w-4 h-4" />,
      suggestion: <Lightbulb className="w-4 h-4" />
    };
    return icons[severity];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-gray-600">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-red-600">
          <AlertCircle className="w-12 h-12 mx-auto mb-4" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const { reviews = [], stats = {} } = data || {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🤖 PR Buddy</h1>
              <p className="text-gray-600 mt-1">AI-Powered Pull Request Reviews</p>
            </div>
            <button
              onClick={fetchReviews}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Reviews"
            value={stats.total || 0}
            icon={<CheckCircle className="w-6 h-6" />}
            color="bg-blue-500"
          />
          <StatCard
            title="Total Comments"
            value={stats.totalComments || 0}
            icon={<Bug className="w-6 h-6" />}
            color="bg-purple-500"
          />
          <StatCard
            title="Test Stubs"
            value={stats.totalTestStubs || 0}
            icon={<Lightbulb className="w-6 h-6" />}
            color="bg-green-500"
          />
          <StatCard
            title="Avg Comments/PR"
            value={stats.avgCommentsPerPR || 0}
            icon={<AlertCircle className="w-6 h-6" />}
            color="bg-orange-500"
          />
        </div>

        {/* Risk Distribution */}
        {stats.byRisk && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Risk Distribution</h2>
            <div className="grid grid-cols-3 gap-4">
              <RiskCard level="low" count={stats.byRisk.low || 0} />
              <RiskCard level="medium" count={stats.byRisk.medium || 0} />
              <RiskCard level="high" count={stats.byRisk.high || 0} />
            </div>
          </div>
        )}

        {/* Issue Categories */}
        {stats.bySeverity && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Issue Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <CategoryCard icon={<Bug />} label="Bugs" count={stats.bySeverity.bug || 0} color="text-red-600" />
              <CategoryCard icon={<Lock />} label="Security" count={stats.bySeverity.security || 0} color="text-orange-600" />
              <CategoryCard icon={<Palette />} label="Style" count={stats.bySeverity.style || 0} color="text-blue-600" />
              <CategoryCard icon={<Lightbulb />} label="Suggestions" count={stats.bySeverity.suggestion || 0} color="text-green-600" />
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Recent Reviews</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {reviews.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <p>No reviews yet. Waiting for pull requests...</p>
              </div>
            ) : (
              reviews.map((review) => (
                <ReviewCard
                  key={`${review.owner}/${review.repo}/${review.pullNumber}`}
                  review={review}
                  onReReview={handleReReview}
                  isReReviewing={reReviewing[`${review.owner}/${review.repo}/${review.pullNumber}`]}
                  getRiskColor={getRiskColor}
                  getRiskIcon={getRiskIcon}
                  getSeverityIcon={getSeverityIcon}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const StatCard = ({ title, value, icon, color }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className={`${color} text-white p-3 rounded-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

const RiskCard = ({ level, count }) => {
  const colors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className={`${colors[level]} border-2 rounded-lg p-4 text-center`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-sm font-medium uppercase">{level} Risk</p>
    </div>
  );
};

const CategoryCard = ({ icon, label, count, color }) => (
  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
    <div className={color}>{icon}</div>
    <div>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  </div>
);

const ReviewCard = ({ review, onReReview, isReReviewing, getRiskColor, getRiskIcon, getSeverityIcon }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <a
              href={review.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-lg font-semibold text-primary hover:underline flex items-center gap-2"
            >
              {review.prTitle}
              <ExternalLink className="w-4 h-4" />
            </a>
            <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getRiskColor(review.riskLevel)}`}>
              {getRiskIcon(review.riskLevel)}
              {review.riskLevel.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {review.owner}/{review.repo} #{review.pullNumber} • by {review.author}
          </p>
          <p className="text-sm text-gray-700 mb-3">{review.summary.one_line}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{review.commentCount} comments</span>
            <span>{review.testStubCount} test stubs</span>
            <span>{new Date(review.reviewedAt).toLocaleString()}</span>
          </div>

          {expanded && (
            <div className="mt-4 space-y-4">
              {review.summary.top_issue && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="font-semibold text-yellow-900 mb-1">Top Priority:</p>
                  <p className="text-yellow-800">{review.summary.top_issue}</p>
                </div>
              )}

              {review.comments && review.comments.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Review Comments:</h4>
                  <div className="space-y-2">
                    {review.comments.map((comment, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-start gap-2 mb-1">
                          {getSeverityIcon(comment.severity)}
                          <span className="font-medium text-sm">{comment.file}:{comment.line}</span>
                          <span className="text-xs px-2 py-1 bg-gray-200 rounded">{comment.severity}</span>
                        </div>
                        <p className="text-sm font-semibold mb-1">{comment.summary}</p>
                        <p className="text-sm text-gray-700">{comment.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            {expanded ? 'Hide' : 'Details'}
          </button>
          <button
            onClick={() => onReReview(review)}
            disabled={isReReviewing}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isReReviewing ? 'animate-spin' : ''}`} />
            Re-review
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

// Made with Bob
