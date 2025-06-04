const express = require('express');
const router = express.Router();
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/authMiddleware');
// const dummyUsers = require('../data/dummyUsers');

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Create dummy users
// router.post('/create-dummy', async (req, res) => {
//   try {
//     await User.deleteMany(); // optional: clear existing users
//     const created = await User.insertMany(dummyUsers);
//     res.status(201).json({ message: 'Dummy users created', data: created });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Create a single user
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    const saved = await user.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Follow/Unfollow a user
router.post('/follow/:userId', async (req, res) => {
  try {
    const { followerId } = req.body;
    const followeeId = req.params.userId;

    if (followerId === followeeId) {
      return res.status(400).json({ message: 'Users cannot follow themselves' });
    }

    // Use a single atomic operation to update both users
    const result = await User.bulkWrite([
      {
        updateOne: {
          filter: { _id: followerId },
          update: {
            $addToSet: { following: followeeId }
          }
        }
      },
      {
        updateOne: {
          filter: { _id: followeeId },
          update: {
            $addToSet: { followers: followerId }
          }
        }
      }
    ]);

    // If no documents were modified, they were already following each other
    // So we need to unfollow
    if (result.modifiedCount === 0) {
      await User.bulkWrite([
        {
          updateOne: {
            filter: { _id: followerId },
            update: {
              $pull: { following: followeeId }
            }
          }
        },
        {
          updateOne: {
            filter: { _id: followeeId },
            update: {
              $pull: { followers: followerId }
            }
          }
        }
      ]);
    }

    // Get the updated users to return their current state
    const [updatedFollower, updatedFollowee] = await Promise.all([
      User.findById(followerId).select('following'),
      User.findById(followeeId).select('followers')
    ]);

    const isFollowing = updatedFollower.following.includes(followeeId);

    res.status(200).json({
      message: isFollowing ? 'Followed successfully' : 'Unfollowed successfully',
      follower: {
        _id: updatedFollower._id,
        following: updatedFollower.following
      },
      followee: {
        _id: updatedFollowee._id,
        followers: updatedFollowee.followers
      }
    });
  } catch (error) {
    console.error('Follow/Unfollow error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get follow status
router.get('/follow-status/:userId', async (req, res) => {
  try {
    const { followerId } = req.query; // ID of the user who might be following
    const followeeId = req.params.userId; // ID of the user to check

    const follower = await User.findById(followerId);
    if (!follower) {
      return res.status(404).json({ message: 'Follower not found' });
    }

    const isFollowing = follower.following?.includes(followeeId) || false;
    res.status(200).json({ isFollowing });
  } catch (error) {
    console.error('Follow status error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get a single user by ID
router.get('/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Profile image upload endpoint
router.post('/profile-image', upload.single('profileImage'), async (req, res) => {
  try {
    const { userId } = req.body;
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const imageUrl = `/uploads/${req.file.filename}`;
    await User.findByIdAndUpdate(userId, { profileImage: imageUrl });
    res.json({ imageUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user information
router.patch('/:userId', authMiddleware, async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.params.userId;

    // Ensure user can only update their own profile
    if (userId !== req.user.userId) {
      return res.status(403).json({ message: 'Not authorized to update this profile' });
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // If username is being updated, check for uniqueness
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    // Only allow username updates
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { username } },
      { new: true, runValidators: true }
    ).select('-password');

    res.json(updatedUser);
  } catch (error) {
    console.error('Update user error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
