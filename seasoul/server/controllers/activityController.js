const Activity = require('../models/Activity');

// Get all activities with sorting and filtering
exports.getActivities = async (req, res) => {
  try {
    const { sort, category, search, limit } = req.query;
    
    let query = {};
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }
    
    let sortOptions = {};
    switch (sort) {
      case 'price-low':
        sortOptions = { price: 1 };
        break;
      case 'price-high':
        sortOptions = { price: -1 };
        break;
      case 'newest':
      default:
        sortOptions = { createdAt: -1 };
        break;
    }
    
    let activitiesQuery = Activity.find(query).sort(sortOptions);
    
    if (limit && !isNaN(limit)) {
      activitiesQuery = activitiesQuery.limit(parseInt(limit));
    }
    
    const activities = await activitiesQuery;
    
    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error('Error in getActivities:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get single activity by ID
exports.getActivityById = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await Activity.findById(id);
    
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found',
      });
    }
    
    res.status(200).json({
      success: true,
      activity,
    });
  } catch (error) {
    console.error('Error in getActivityById:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get featured activities
exports.getFeaturedActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ isFeatured: true })
      .sort({ createdAt: -1 })
      .limit(3);
    
    res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error('Error in getFeaturedActivities:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get trending activities
exports.getTrendingActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ isTrending: true })
      .limit(4);
    
    res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error('Error in getTrendingActivities:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get activities by category
exports.getActivitiesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const activities = await Activity.find({ category });
    
    res.status(200).json({
      success: true,
      count: activities.length,
      activities,
    });
  } catch (error) {
    console.error('Error in getActivitiesByCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};