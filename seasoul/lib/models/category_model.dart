class CategoryModel {
  final String id;
  final String name;
  final String slug;
  final String description;
  final String icon; // This will store the icon name (e.g., 'home', 'car', 'scuba-diving')
  final String iconType; // 'material' or 'lucide'
  final String color;
  final int sortOrder;
  final bool isActive;

  CategoryModel({
    required this.id,
    required this.name,
    required this.slug,
    required this.description,
    required this.icon,
    this.iconType = 'material',
    required this.color,
    required this.sortOrder,
    required this.isActive,
  });

  factory CategoryModel.fromJson(Map<String, dynamic> json) {
    return CategoryModel(
      id: json['_id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      slug: json['slug']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      icon: json['icon']?.toString() ?? 'home',
      iconType: json['iconType']?.toString() ?? 'material',
      color: json['color']?.toString() ?? '#00E5FF',
      sortOrder: json['sortOrder'] ?? 0,
      isActive: json['isActive'] ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'name': name,
    'slug': slug,
    'description': description,
    'icon': icon,
    'iconType': iconType,
    'color': color,
    'sortOrder': sortOrder,
    'isActive': isActive,
  };
}