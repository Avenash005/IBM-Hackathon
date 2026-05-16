import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  repositoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  owner: {
    type: String,
    required: true
  },
  repo: {
    type: String,
    required: true
  },
  pullNumber: {
    type: Number,
    required: true
  },
  prTitle: {
    type: String,
    required: true
  },
  prUrl: {
    type: String,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  commitSha: {
    type: String,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  qualityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  commentCount: {
    type: Number,
    default: 0
  },
  testStubCount: {
    type: Number,
    default: 0
  },
  summary: {
    risk_level: String,
    one_line: String,
    top_issue: String
  },
  comments: [{
    file: String,
    line: Number,
    severity: {
      type: String,
      enum: ['bug', 'security', 'style', 'suggestion']
    },
    summary: String,
    detail: String,
    suggested_fix: String
  }],
  testStubs: [{
    function_name: String,
    file: String,
    stub: String
  }],
  feedback: {
    helpful: {
      type: Number,
      default: 0
    },
    notHelpful: {
      type: Number,
      default: 0
    },
    falsePositives: [{
      commentIndex: Number,
      reason: String,
      reportedAt: Date
    }]
  },
  reviewedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
reviewSchema.index({ repositoryId: 1, pullNumber: 1 }, { unique: true });
reviewSchema.index({ userId: 1, reviewedAt: -1 });
reviewSchema.index({ owner: 1, repo: 1, pullNumber: 1 });

// Method to add feedback
reviewSchema.methods.addFeedback = async function(type, commentIndex, reason) {
  if (type === 'helpful') {
    this.feedback.helpful += 1;
  } else if (type === 'notHelpful') {
    this.feedback.notHelpful += 1;
  } else if (type === 'falsePositive' && commentIndex !== undefined) {
    this.feedback.falsePositives.push({
      commentIndex,
      reason,
      reportedAt: new Date()
    });
  }
  await this.save();
};

// Method to get public review data
reviewSchema.methods.getPublicData = function() {
  return {
    id: this._id,
    owner: this.owner,
    repo: this.repo,
    pullNumber: this.pullNumber,
    prTitle: this.prTitle,
    prUrl: this.prUrl,
    author: this.author,
    riskLevel: this.riskLevel,
    qualityScore: this.qualityScore,
    commentCount: this.commentCount,
    testStubCount: this.testStubCount,
    summary: this.summary,
    comments: this.comments,
    testStubs: this.testStubs,
    reviewedAt: this.reviewedAt,
    createdAt: this.createdAt
  };
};

const Review = mongoose.model('Review', reviewSchema);

export default Review;

// Made with Bob
