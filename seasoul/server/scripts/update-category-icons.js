// Script to update existing categories with proper icon and color values
// Run this with: node server/scripts/update-category-icons.js

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const Category = require('../models/Category');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/seasoul', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Default icon mappings based on category names
const iconMappings = {
  'premium cottage rooms': { icon: 'villa', color: '#2ECC71' },
  'cottage rooms': { icon: 'cottage', color: '#0099CC' },
  'home stay rooms': { icon: 'house', color: '#27AE60' },
  'packages': { icon: 'luggage', color: '#F1C40F' },
  'rent a bike': { icon: 'directions_bike', color: '#E74C3C' },
  'water sports activity': { icon: 'scuba_diving', color: '#00E5FF' },
  'lakshadweep traditional products': { icon: 'handyman', color: '#9B59B6' },
  'event program': { icon: 'event', color: '#FF6B35' },
};

async function updateCategoryIcons() {
  try {
    console.log('🔄 Fetching all categories...');
    const categories = await Category.find({});
    
    console.log(`✅ Found ${categories.length} categories`);
    
    for (const category of categories) {
      const nameLower = category.name.toLowerCase();
      const mapping = iconMappings[nameLower];
      
      if (mapping) {
        category.icon = mapping.icon;
        category.color = mapping.color;
        category.iconType = 'material';
        await category.save();
        console.log(`✅ Updated "${category.name}" -> Icon: ${mapping.icon}, Color: ${mapping.color}`);
      } else {
        // Set defaults if no mapping found
        if (!category.icon || category.icon === '') {
          category.icon = 'category';
          category.iconType = 'material';
          category.color = category.color || '#00E5FF';
          await category.save();
          console.log(`⚠️  Set default for "${category.name}" -> Icon: category, Color: ${category.color}`);
        } else {
          console.log(`ℹ️  Skipped "${category.name}" (already has icon: ${category.icon})`);
        }
      }
    }
    
    console.log('\n✅ Category icons updated successfully!');
    console.log('\n📋 Current categories:');
    
    const updatedCategories = await Category.find({}).sort({ sortOrder: 1, name: 1 });
    updatedCategories.forEach(cat => {
      console.log(`   - ${cat.name}: ${cat.icon} (${cat.color})`);
    });
    
  } catch (error) {
    console.error('❌ Error updating categories:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
updateCategoryIcons();
