import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../services/api';

<<<<<<< HEAD
// ✅ Available Material Icons - Expanded Collection
=======
// ✅ Available Material Icons (same as before)
>>>>>>> 5192d474cadff7e77b099b2bda5cfc0dcd24fd38
const AVAILABLE_ICONS = [
  // Home & Accommodation
  { name: 'home', label: 'Home' },
  { name: 'home_work', label: 'Home Work' },
  { name: 'home_repair_service', label: 'Home Repair' },
  { name: 'house', label: 'House' },
<<<<<<< HEAD
  { name: 'cottage', label: 'Cottage' },
  { name: 'cabin', label: 'Cabin' },
  { name: 'bed', label: 'Bed' },
  { name: 'hotel', label: 'Hotel' },
  { name: 'villa', label: 'Villa' },
  { name: 'apartment', label: 'Apartment' },
  { name: 'night_shelter', label: 'Night Shelter' },
  { name: 'holiday_village', label: 'Holiday Village' },
  { name: 'bungalow', label: 'Bungalow' },
  { name: 'roofing', label: 'Roofing' },
  { name: 'king_bed', label: 'King Bed' },
  { name: 'single_bed', label: 'Single Bed' },
=======
  { name: 'house_outlined', label: 'House Outlined' },
  { name: 'cottage', label: 'Cottage' },
  { name: 'cottage_outlined', label: 'Cottage Outlined' },
  { name: 'cabin', label: 'Cabin' },
  { name: 'bed', label: 'Bed' },
  { name: 'bed_outlined', label: 'Bed Outlined' },
  { name: 'hotel', label: 'Hotel' },
  { name: 'villa', label: 'Villa' },
  { name: 'apartment', label: 'Apartment' },
  { name: 'family_restroom', label: 'Family Restroom' },
  { name: 'holiday_village', label: 'Holiday Village' },
  { name: 'hiking', label: 'Hiking' },
  { name: 'camping', label: 'Camping' },
>>>>>>> 5192d474cadff7e77b099b2bda5cfc0dcd24fd38
  
  // Transportation
  { name: 'car_rental', label: 'Car Rental' },
  { name: 'electric_car', label: 'Electric Car' },
  { name: 'moped', label: 'Moped' },
  { name: 'electric_moped', label: 'Electric Moped' },
  { name: 'motorcycle', label: 'Motorcycle' },
<<<<<<< HEAD
  { name: 'electric_bike', label: 'Electric Bike' },
  { name: 'pedal_bike', label: 'Pedal Bike' },
  { name: 'directions_bike', label: 'Bicycle' },
  { name: 'directions_car', label: 'Car' },
  { name: 'two_wheeler', label: 'Two Wheeler' },
  { name: 'airport_shuttle', label: 'Airport Shuttle' },
  { name: 'directions_bus', label: 'Bus' },
  { name: 'train', label: 'Train' },
  { name: 'tram', label: 'Tram' },
  { name: 'subway', label: 'Subway' },
  { name: 'flight', label: 'Flight' },
  { name: 'flight_takeoff', label: 'Takeoff' },
  { name: 'flight_land', label: 'Landing' },
  { name: 'directions_boat', label: 'Boat' },
  { name: 'sailing', label: 'Sailing' },
  { name: 'ferry', label: 'Ferry' },
  { name: 'paragliding', label: 'Paragliding' },
  
  // Water Sports & Beach
  { name: 'scuba_diving', label: 'Scuba Diving' },
  { name: 'surfing', label: 'Surfing' },
  { name: 'kitesurfing', label: 'Kitesurfing' },
  { name: 'kayaking', label: 'Kayaking' },
=======
  { name: 'directions_bike', label: 'Bicycle' },
  { name: 'directions_car', label: 'Car' },
  { name: 'two_wheeler', label: 'Two Wheeler' },
  { name: 'directions_bus', label: 'Bus' },
  { name: 'train', label: 'Train' },
  { name: 'flight', label: 'Flight' },
  { name: 'flight_takeoff', label: 'Flight Takeoff' },
  { name: 'directions_boat', label: 'Boat' },
  { name: 'sailing', label: 'Sailing' },
  
  // Water Sports
  { name: 'scuba_diving', label: 'Scuba Diving' },
  { name: 'surfing', label: 'Surfing' },
  { name: 'kayaking', label: 'Kayaking' },
  { name: 'snowboarding', label: 'Snowboarding' },
>>>>>>> 5192d474cadff7e77b099b2bda5cfc0dcd24fd38
  { name: 'pool', label: 'Pool' },
  { name: 'water', label: 'Water' },
  { name: 'waves', label: 'Waves' },
  { name: 'beach_access', label: 'Beach' },
<<<<<<< HEAD
  { name: 'umbrella', label: 'Umbrella' },
  { name: 'water_drop', label: 'Water Drop' },
  
  // Winter & Snow Sports
  { name: 'snowboarding', label: 'Snowboarding' },
  { name: 'downhill_skiing', label: 'Skiing' },
  { name: 'ac_unit', label: 'Snowflake' },
  
  // Food & Dining
  { name: 'restaurant', label: 'Restaurant' },
  { name: 'restaurant_menu', label: 'Menu' },
=======
  { name: 'beach_umbrella', label: 'Beach Umbrella' },
  
  // Food & Dining
  { name: 'restaurant', label: 'Restaurant' },
  { name: 'restaurant_menu', label: 'Restaurant Menu' },
>>>>>>> 5192d474cadff7e77b099b2bda5cfc0dcd24fd38
  { name: 'ramen_dining', label: 'Ramen' },
  { name: 'dinner_dining', label: 'Dinner' },
  { name: 'lunch_dining', label: 'Lunch' },
  { name: 'breakfast_dining', label: 'Breakfast' },
  { name: 'brunch_dining', label: 'Brunch' },
  { name: 'fastfood', label: 'Fast Food' },
  { name: 'food_bank', label: 'Food Bank' },
  { name: 'room_service', label: 'Room Service' },
  { name: 'free_breakfast', label: 'Free Breakfast' },
<<<<<<< HEAD
  { name: 'local_cafe', label: 'Cafe' },
  { name: 'local_bar', label: 'Bar' },
  { name: 'local_pizza', label: 'Pizza' },
  { name: 'icecream', label: 'Ice Cream' },
  { name: 'cake', label: 'Cake' },
  { name: 'coffee', label: 'Coffee' },
  { name: 'wine_bar', label: 'Wine Bar' },
  { name: 'liquor', label: 'Liquor' },
  { name: 'tapas', label: 'Tapas' },
  { name: 'egg', label: 'Egg' },
  { name: 'set_meal', label: 'Set Meal' },
  { name: 'soup_kitchen', label: 'Soup' },
  
  // Shopping & Products
=======
  
  // Shopping
>>>>>>> 5192d474cadff7e77b099b2bda5cfc0dcd24fd38
  { name: 'shopping_bag', label: 'Shopping Bag' },
  { name: 'shopping_cart', label: 'Shopping Cart' },
  { name: 'local_mall', label: 'Mall' },
  { name: 'storefront', label: 'Storefront' },
  { name: 'store', label: 'Store' },
<<<<<<< HEAD
  { name: 'local_convenience_store', label: 'Convenience' },
  { name: 'local_grocery_store', label: 'Grocery' },
  { name: 'local_offer', label: 'Offer' },
  { name: 'card_giftcard', label: 'Gift Card' },
  { name: 'redeem', label: 'Redeem' },
  { name: 'checkroom', label: 'Checkroom' },
  { name: 'handyman', label: 'Handyman' },
  { name: 'build', label: 'Build' },
  { name: 'construction', label: 'Construction' },
  { name: 'design_services', label: 'Design' },
  { name: 'palette', label: 'Palette' },
  { name: 'brush', label: 'Brush' },
  { name: 'auto_awesome', label: 'Awesome' },
  
  // Events & Entertainment
  { name: 'event', label: 'Event' },
  { name: 'event_available', label: 'Event Available' },
  { name: 'celebration', label: 'Celebration' },
  { name: 'festival', label: 'Festival' },
  { name: 'party_mode', label: 'Party' },
  { name: 'music_note', label: 'Music' },
  { name: 'audiotrack', label: 'Audio' },
  { name: 'headphones', label: 'Headphones' },
  { name: 'piano', label: 'Piano' },
  { name: 'theaters', label: 'Theater' },
  { name: 'movie', label: 'Movie' },
  { name: 'local_movies', label: 'Cinema' },
  { name: 'video_library', label: 'Video Library' },
  { name: 'live_tv', label: 'Live TV' },
  { name: 'casino', label: 'Casino' },
  { name: 'attractions', label: 'Attractions' },
  
  // Sports & Fitness
  { name: 'sports', label: 'Sports' },
  { name: 'sports_baseball', label: 'Baseball' },
  { name: 'sports_basketball', label: 'Basketball' },
  { name: 'sports_cricket', label: 'Cricket' },
  { name: 'sports_football', label: 'Football' },
  { name: 'sports_soccer', label: 'Soccer' },
  { name: 'sports_tennis', label: 'Tennis' },
  { name: 'sports_volleyball', label: 'Volleyball' },
  { name: 'sports_golf', label: 'Golf' },
  { name: 'sports_hockey', label: 'Hockey' },
  { name: 'sports_rugby', label: 'Rugby' },
  { name: 'sports_handball', label: 'Handball' },
  { name: 'sports_kabaddi', label: 'Kabaddi' },
  { name: 'sports_martial_arts', label: 'Martial Arts' },
  { name: 'sports_mma', label: 'MMA' },
  { name: 'sports_gymnastics', label: 'Gymnastics' },
  { name: 'fitness_center', label: 'Fitness' },
  { name: 'spa', label: 'Spa' },
  { name: 'hot_tub', label: 'Hot Tub' },
  
  // Nature & Outdoor
=======
  { name: 'shop', label: 'Shop' },
  { name: 'local_offer', label: 'Offer' },
  { name: 'card_giftcard', label: 'Gift Card' },
  { name: 'handmade', label: 'Handmade' },
  { name: 'design_services', label: 'Design' },
  { name: 'art_track', label: 'Art' },
  
  // Events
  { name: 'event', label: 'Event' },
  { name: 'event_available', label: 'Event Available' },
  { name: 'celebration', label: 'Celebration' },
  { name: 'music_note', label: 'Music' },
  { name: 'theaters', label: 'Theater' },
  { name: 'movie', label: 'Movie' },
  { name: 'sports', label: 'Sports' },
  { name: 'sports_baseball', label: 'Baseball' },
  { name: 'sports_cricket', label: 'Cricket' },
  { name: 'sports_football', label: 'Football' },
  { name: 'sports_tennis', label: 'Tennis' },
  { name: 'sports_volleyball', label: 'Volleyball' },
  
  // Nature
>>>>>>> 5192d474cadff7e77b099b2bda5cfc0dcd24fd38
  { name: 'nature', label: 'Nature' },
  { name: 'nature_people', label: 'Nature People' },
  { name: 'park', label: 'Park' },
  { name: 'forest', label: 'Forest' },
<<<<<<< HEAD
  { name: 'grass', label: 'Grass' },
  { name: 'eco', label: 'Eco' },
  { name: 'yard', label: 'Yard' },
  { name: 'local_florist', label: 'Florist' },
  { name: 'terrain', label: 'Terrain' },
  { name: 'landscape', label: 'Landscape' },
  { name: 'emoji_nature', label: 'Nature Emoji' },
  { name: 'agriculture', label: 'Agriculture' },
  
  // Activities & Adventure
  { name: 'hiking', label: 'Hiking' },
  { name: 'camping', label: 'Camping' },
  { name: 'outdoor_grill', label: 'BBQ' },
  { name: 'fireplace', label: 'Fireplace' },
  { name: 'directions_run', label: 'Running' },
  { name: 'directions_walk', label: 'Walking' },
  { name: 'nordic_walking', label: 'Nordic Walking' },
  { name: 'golf_course', label: 'Golf Course' },
  { name: 'roller_skating', label: 'Roller Skating' },
  { name: 'skateboarding', label: 'Skateboarding' },
  
  // Animals & Wildlife
  { name: 'pets', label: 'Pets' },
  { name: 'cruelty_free', label: 'Cruelty Free' },
  
  // Travel & Tourism
  { name: 'luggage', label: 'Luggage' },
  { name: 'backpack', label: 'Backpack' },
  { name: 'explore', label: 'Explore' },
  { name: 'tour', label: 'Tour' },
  { name: 'map', label: 'Map' },
  { name: 'location_on', label: 'Location' },
  { name: 'place', label: 'Place' },
  { name: 'pin_drop', label: 'Pin Drop' },
  { name: 'push_pin', label: 'Push Pin' },
  { name: 'flag', label: 'Flag' },
  { name: 'emoji_flags', label: 'Flags' },
  { name: 'public', label: 'Public' },
  { name: 'travel_explore', label: 'Travel Explore' },
  
  // Photography & Media
  { name: 'camera_alt', label: 'Camera' },
  { name: 'photo_camera', label: 'Photo Camera' },
  { name: 'photo', label: 'Photo' },
  { name: 'photo_library', label: 'Photo Library' },
  { name: 'image', label: 'Image' },
  { name: 'collections', label: 'Collections' },
  { name: 'photo_album', label: 'Album' },
  { name: 'videocam', label: 'Video' },
  
  // Services & Utilities
  { name: 'local_laundry_service', label: 'Laundry' },
  { name: 'local_shipping', label: 'Shipping' },
  { name: 'delivery_dining', label: 'Delivery' },
  { name: 'cleaning_services', label: 'Cleaning' },
  { name: 'plumbing', label: 'Plumbing' },
  { name: 'electrical_services', label: 'Electrical' },
  { name: 'hvac', label: 'HVAC' },
  { name: 'pest_control', label: 'Pest Control' },
  { name: 'miscellaneous_services', label: 'Services' },
  
  // Health & Wellness
  { name: 'favorite', label: 'Favorite' },
  { name: 'health_and_safety', label: 'Health & Safety' },
  { name: 'medical_services', label: 'Medical' },
  { name: 'local_hospital', label: 'Hospital' },
  { name: 'local_pharmacy', label: 'Pharmacy' },
  { name: 'healing', label: 'Healing' },
  { name: 'self_improvement', label: 'Self Improvement' },
  { name: 'psychology', label: 'Psychology' },
  { name: 'mood', label: 'Mood' },
  { name: 'sentiment_satisfied', label: 'Satisfied' },
  
  // Miscellaneous
  { name: 'star', label: 'Star' },
  { name: 'star_border', label: 'Star Border' },
  { name: 'grade', label: 'Grade' },
  { name: 'emoji_emotions', label: 'Emoji' },
  { name: 'emoji_events', label: 'Trophy' },
  { name: 'military_tech', label: 'Medal' },
  { name: 'workspace_premium', label: 'Premium' },
  { name: 'verified', label: 'Verified' },
  { name: 'new_releases', label: 'New' },
  { name: 'tips_and_updates', label: 'Tips' },
  { name: 'lightbulb', label: 'Lightbulb' },
  { name: 'wb_sunny', label: 'Sunny' },
  { name: 'wb_twilight', label: 'Twilight' },
  { name: 'nightlight', label: 'Nightlight' },
  { name: 'category', label: 'Category' },
  { name: 'apps', label: 'Apps' },
  { name: 'dashboard', label: 'Dashboard' },
  { name: 'view_module', label: 'Module' },
  { name: 'widgets', label: 'Widgets' },
=======
  { name: 'palmtree', label: 'Palm Tree' },
  { name: 'flower', label: 'Flower' },
  { name: 'butterfly', label: 'Butterfly' },
  { name: 'island', label: 'Island' },
  { name: 'terrain', label: 'Terrain' },
  
  // Activities
  { name: 'directions_run', label: 'Running' },
  { name: 'walking', label: 'Walking' },
  { name: 'fitness_center', label: 'Fitness' },
  { name: 'golf_course', label: 'Golf' },
  { name: 'bath', label: 'Bath' },
  
  // Miscellaneous
  { name: 'luggage', label: 'Luggage' },
  { name: 'backpack', label: 'Backpack' },
  { name: 'tent', label: 'Tent' },
  { name: 'compass', label: 'Compass' },
  { name: 'map', label: 'Map' },
  { name: 'location_on', label: 'Location' },
  { name: 'push_pin', label: 'Pin' },
  { name: 'flag', label: 'Flag' },
  { name: 'camera_alt', label: 'Camera' },
  { name: 'photo', label: 'Photo' },
  { name: 'package', label: 'Package' },
  { name: 'inventory', label: 'Inventory' },
  { name: 'local_shipping', label: 'Shipping' },
  { name: 'delivery_dining', label: 'Delivery' },
  { name: 'cleaning_services', label: 'Cleaning' },
>>>>>>> 5192d474cadff7e77b099b2bda5cfc0dcd24fd38
];

const COLOR_OPTIONS = [
  { name: 'Ocean Blue', value: '#0099CC' },
  { name: 'Emerald Green', value: '#2ECC71' },
  { name: 'Sunset Orange', value: '#FF6B35' },
  { name: 'Coral', value: '#FF6B6B' },
  { name: 'Purple', value: '#9B59B6' },
  { name: 'Teal', value: '#00A694' },
  { name: 'Deep Navy', value: '#1A2B49' },
  { name: 'Gold', value: '#F1C40F' },
  { name: 'Pink', value: '#E91E63' },
  { name: 'Red', value: '#E74C3C' },
  { name: 'Green', value: '#27AE60' },
  { name: 'Blue', value: '#3498DB' },
  { name: 'Cyan', value: '#00E5FF' },
  { name: 'Magenta', value: '#9E0FA9' },
];

export default function CategoryForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchIcon, setSearchIcon] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'category', // ✅ Default Material Icon name
    color: '#0099CC',
  });

  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) {
      fetchCategory();
    }
  }, [id]);

  const fetchCategory = async () => {
    try {
      const response = await api.get(`/categories/${id}`);
      const category = response.data.category;
      setFormData({
        name: category.name || '',
        description: category.description || '',
        // ✅ If icon is an emoji, convert to default; else use it
        icon: category.icon && !category.icon.match(/^[a-zA-Z_]+$/) ? 'category' : (category.icon || 'category'),
        color: category.color || '#0099CC',
      });
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('Failed to load category data');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading(isEdit ? 'Updating category...' : 'Creating category...');

    try {
      // ✅ Ensure icon is a valid Material Icon name (not emoji) and include iconType
      const payload = {
        ...formData,
        icon: formData.icon || 'category',
        iconType: 'material', // Explicitly set iconType
      };

      if (isEdit) {
        await api.put(`/categories/${id}`, payload);
        toast.success('Category updated successfully! 🎉', {
          id: toastId,
          duration: 3000,
        });
      } else {
        await api.post('/categories', payload);
        toast.success('Category created successfully! 🎉', {
          id: toastId,
          duration: 3000,
        });
      }
      navigate('/categories');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save category', {
        id: toastId,
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const selectIcon = (iconName) => {
    setFormData({
      ...formData,
      icon: iconName,
    });
  };

  const selectColor = (colorValue) => {
    setFormData({
      ...formData,
      color: colorValue,
    });
  };

  const filteredIcons = AVAILABLE_ICONS.filter(icon =>
    icon.label.toLowerCase().includes(searchIcon.toLowerCase()) ||
    icon.name.toLowerCase().includes(searchIcon.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {isEdit ? 'Edit Category' : 'Add Category'}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="space-y-6">
          {/* Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF]"
              required
              placeholder="e.g., Premium Cottage Rooms"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF]"
              placeholder="Describe this category..."
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Icon *
            </label>
            
            {/* Selected Icon Preview */}
            <div className="flex items-center gap-4 mb-4 p-4 bg-gray-50 rounded-xl">
              <div className="w-16 h-16 bg-white rounded-xl border-2 border-[#00E5FF] flex items-center justify-center shadow-sm">
                <span className="material-icons text-4xl" style={{ color: formData.color }}>
                  {formData.icon || 'category'}
                </span>
              </div>
              <div>
                <p className="font-medium text-[#1A2B49]">Selected Icon</p>
                <p className="text-sm text-gray-500">{formData.icon || 'category'}</p>
              </div>
            </div>

            {/* Icon Search */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search icons..."
                value={searchIcon}
                onChange={(e) => setSearchIcon(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#00E5FF] focus:border-[#00E5FF]"
              />
              <span className="material-icons absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl">
                search
              </span>
            </div>

            {/* Icon Grid */}
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 max-h-64 overflow-y-auto p-2 border border-gray-200 rounded-xl">
              {filteredIcons.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => selectIcon(icon.name)}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.icon === icon.name
                      ? 'border-[#00E5FF] bg-[#00E5FF]/10 shadow-md'
                      : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                  title={icon.label}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="material-icons text-2xl text-[#1A2B49]">
                      {icon.name}
                    </span>
                    <span className="text-[8px] text-gray-500 text-center leading-tight">
                      {icon.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>
            {filteredIcons.length === 0 && (
              <p className="text-center text-gray-500 py-4">No icons found</p>
            )}
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Color
            </label>
            <div className="flex flex-wrap gap-3">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => selectColor(color.value)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    formData.color === color.value
                      ? 'border-[#1A2B49] scale-110 shadow-md'
                      : 'border-gray-200 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-gray-500">Selected:</span>
              <span className="px-3 py-1 rounded-full text-sm text-white" style={{ backgroundColor: formData.color }}>
                {formData.color}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 mt-6">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-[#00E5FF] text-[#0D1516] font-bold rounded-xl hover:opacity-90 disabled:opacity-50 w-full sm:w-auto"
          >
            {loading ? 'Saving...' : isEdit ? 'Update Category' : 'Create Category'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/categories')}
            className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-300 w-full sm:w-auto"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}