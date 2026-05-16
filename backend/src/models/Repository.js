import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema({
  owner: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  githubId: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  language: {
    type: String
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  webhookId: {
    type: String
  },
  webhookSecret: {
    type: String
  },
  settings: {
    autoReview: {
      type: Boolean,
      default: true
    },
    reviewOnOpen: {
      type: Boolean,
      default: true
    },
    reviewOnUpdate: {
      type: Boolean,
      default: true
    },
    minQualityScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    blockMergeOnHighRisk: {
      type: Boolean,
      default: false
    },
    customRules: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
    },
    notifications: {
      enabled: {
        type: Boolean,
        default: true
      },
      onHighRisk: {
        type: Boolean,
        default: true
      },
      onSecurityIssue: {
        type: Boolean,
        default: true
      }
    }
  },
  stats: {
    totalReviews: {
      type: Number,
      default: 0
    },
    totalComments: {
      type: Number,
      default: 0
    },
    totalTestStubs: {
      type: Number,
      default: 0
    },
    avgQualityScore: {
      type: Number,
      default: 0
    },
    lastReviewAt: {
      type: Date
    },
    riskDistribution: {
      low: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      high: { type: Number, default: 0 }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
repositorySchema.index({ userId: 1, fullName: 1 });
repositorySchema.index({ owner: 1, name: 1 });

// Method to update stats
repositorySchema.methods.updateStats = async function(review) {
  this.stats.totalReviews += 1;
  this.stats.totalComments += review.commentCount || 0;
  this.stats.totalTestStubs += review.testStubCount || 0;
  this.stats.lastReviewAt = new Date();
  
  // Update risk distribution
  if (review.riskLevel) {
    this.stats.riskDistribution[review.riskLevel] += 1;
  }
  
  // Update average quality score
  if (review.qualityScore) {
    const totalScore = this.stats.avgQualityScore * (this.stats.totalReviews - 1) + review.qualityScore;
    this.stats.avgQualityScore = totalScore / this.stats.totalReviews;
  }
  
  await this.save();
};

// Method to get public info
repositorySchema.methods.getPublicInfo = function() {
  return {
    id: this._id,
    owner: this.owner,
    name: this.name,
    fullName: this.fullName,
    description: this.description,
    language: this.language,
    isPrivate: this.isPrivate,
    settings: this.settings,
    stats: this.stats,
    isActive: this.isActive,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

const Repository = mongoose.model('Repository', repositorySchema);

export default Repository;

// Made with Bob
