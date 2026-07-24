const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    icon: {
      type: String,
      default: 'category', // ✅ Changed from emoji to Material Icon name
      trim: true,
    },
    iconType: {
      type: String,
      enum: ['material', 'lucide', 'emoji'],
      default: 'material', // ✅ Store icon type
    },
    color: {
      type: String,
      default: '#00E5FF',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-generate slug before saving
CategorySchema.pre('save', async function() {
  if (this.isModified('name') || !this.slug) {
    let slug = this.name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '');
    
    if (!slug) {
      slug = 'category-' + Date.now();
    }
    
    this.slug = slug;
  }
});

module.exports = mongoose.model('Category', CategorySchema);