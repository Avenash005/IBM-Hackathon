import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  githubId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  displayName: {
    type: String
  },
  avatar: {
    type: String
  },
  githubAccessToken: {
    type: String,
    required: true
  },
  repositories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository'
  }],
  settings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      browser: {
        type: Boolean,
        default: true
      },
      digest: {
        type: String,
        enum: ['none', 'daily', 'weekly'],
        default: 'daily'
      }
    },
    reviewRules: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {}
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
    }
  },
  lastLoginAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt GitHub access token before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('githubAccessToken')) {
    return next();
  }
  
  // Simple encryption (in production, use proper encryption like crypto)
  const salt = await bcrypt.genSalt(10);
  this.githubAccessToken = await bcrypt.hash(this.githubAccessToken, salt);
  next();
});

// Method to compare tokens
userSchema.methods.compareToken = async function(token) {
  return await bcrypt.compare(token, this.githubAccessToken);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    githubId: this.githubId,
    username: this.username,
    email: this.email,
    displayName: this.displayName,
    avatar: this.avatar,
    settings: this.settings,
    stats: this.stats,
    createdAt: this.createdAt,
    lastLoginAt: this.lastLoginAt
  };
};

const User = mongoose.model('User', userSchema);

export default User;

// Made with Bob
