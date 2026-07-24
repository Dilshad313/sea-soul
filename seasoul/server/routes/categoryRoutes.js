const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { isAdmin } = require('../middleware/adminMiddleware');

// ✅ Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1, name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Get active categories (for user panel)
router.get('/active', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1, name: 1 })
      .select('name slug color icon iconType description sortOrder');
    res.json({ success: true, categories });
  } catch (error) {
    console.error('❌ Error fetching active categories:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Get single category
router.get('/:id', isAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.json({ success: true, category });
  } catch (error) {
    console.error('❌ Error fetching category:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Create category
router.post('/', isAdmin, async (req, res) => {
  try {
    const { name, description, icon, iconType, color, sortOrder } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    // Check if category already exists
    const existing = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = new Category({
      name: name.trim(),
      description: description || '',
      icon: icon || 'category',
      iconType: iconType || 'material',
      color: color || '#00E5FF',
      sortOrder: sortOrder || 0,
    });

    await category.save();
    res.status(201).json({ success: true, message: 'Category created successfully', category });
  } catch (error) {
    console.error('❌ Error creating category:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Update category
router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { name, description, icon, iconType, color, sortOrder, isActive } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (name && name !== category.name) {
      const existing = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') } 
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Category name already exists' });
      }
      category.name = name;
    }

    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (iconType !== undefined) category.iconType = iconType;
    if (color !== undefined) category.color = color;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    res.json({ success: true, message: 'Category updated successfully', category });
  } catch (error) {
    console.error('❌ Error updating category:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ✅ Delete category
router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;