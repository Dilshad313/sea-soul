class ReviewModel {
  final String id;
  final String userId;
  final String? productId;
  final String? activityId;
  final String bookingId;
  final double rating;
  final String title;
  final String comment;
  final List<String> images;
  final bool isVerified;
  final bool isApproved;
  final int helpfulCount;
  final String itemType;
  final String itemName;
  final String userName;
  final String userProfileImage;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool isEdited;
  final DateTime? editedAt;
  final Map<String, dynamic>? user; // ✅ Added for populated user

  ReviewModel({
    required this.id,
    required this.userId,
    this.productId,
    this.activityId,
    required this.bookingId,
    required this.rating,
    required this.title,
    required this.comment,
    this.images = const [],
    this.isVerified = false,
    this.isApproved = false,
    this.helpfulCount = 0,
    required this.itemType,
    required this.itemName,
    required this.userName,
    required this.userProfileImage,
    required this.createdAt,
    required this.updatedAt,
    this.isEdited = false,
    this.editedAt,
    this.user,
  });

  // ✅ Safe fromJson with null checks
  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    // ✅ Safe string getter
    String getString(String key, {String defaultValue = ''}) {
      final value = json[key];
      if (value == null) return defaultValue;
      if (value is String) return value;
      if (value is Map) return defaultValue; // ✅ Return default if Map
      return value.toString();
    }

    // ✅ Safe int getter
    int getInt(String key, {int defaultValue = 0}) {
      final value = json[key];
      if (value == null) return defaultValue;
      if (value is int) return value;
      if (value is double) return value.toInt();
      if (value is String) return int.tryParse(value) ?? defaultValue;
      return defaultValue;
    }

    // ✅ Safe double getter
    double getDouble(String key, {double defaultValue = 0.0}) {
      final value = json[key];
      if (value == null) return defaultValue;
      if (value is double) return value;
      if (value is int) return value.toDouble();
      if (value is String) return double.tryParse(value) ?? defaultValue;
      return defaultValue;
    }

    // ✅ Safe bool getter
    bool getBool(String key, {bool defaultValue = false}) {
      final value = json[key];
      if (value == null) return defaultValue;
      if (value is bool) return value;
      if (value is String) return value.toLowerCase() == 'true';
      return defaultValue;
    }

    // ✅ Safe List getter
    List<String> getStringList(String key) {
      final value = json[key];
      if (value == null) return [];
      if (value is List) {
        return value.map((e) {
          if (e is String) return e;
          return e.toString();
        }).toList();
      }
      return [];
    }

    // ✅ Safe DateTime getter
    DateTime? getDateTime(String key) {
      final value = json[key];
      if (value == null) return null;
      if (value is DateTime) return value;
      if (value is String) {
        try {
          return DateTime.parse(value);
        } catch (e) {
          return null;
        }
      }
      return null;
    }

    // ✅ Get userId safely
    String userId = '';
    final userIdValue = json['userId'];
    if (userIdValue is String) {
      userId = userIdValue;
    } else if (userIdValue is Map && userIdValue['_id'] != null) {
      userId = userIdValue['_id'].toString();
    }

    // ✅ Get productId safely
    String? productId;
    final productIdValue = json['productId'];
    if (productIdValue is String) {
      productId = productIdValue;
    } else if (productIdValue is Map && productIdValue['_id'] != null) {
      productId = productIdValue['_id'].toString();
    }

    // ✅ Get activityId safely
    String? activityId;
    final activityIdValue = json['activityId'];
    if (activityIdValue is String) {
      activityId = activityIdValue;
    } else if (activityIdValue is Map && activityIdValue['_id'] != null) {
      activityId = activityIdValue['_id'].toString();
    }

    // ✅ Get bookingId safely
    String bookingId = '';
    final bookingIdValue = json['bookingId'];
    if (bookingIdValue is String) {
      bookingId = bookingIdValue;
    } else if (bookingIdValue is Map && bookingIdValue['_id'] != null) {
      bookingId = bookingIdValue['_id'].toString();
    }

    // ✅ Get user safely
    Map<String, dynamic>? user;
    final userValue = json['userId'];
    if (userValue is Map<String, dynamic>) {
      user = userValue;
    }

    return ReviewModel(
      id: getString('_id'),
      userId: userId,
      productId: productId,
      activityId: activityId,
      bookingId: bookingId,
      rating: getDouble('rating'),
      title: getString('title'),
      comment: getString('comment'),
      images: getStringList('images'),
      isVerified: getBool('isVerified'),
      isApproved: getBool('isApproved'),
      helpfulCount: getInt('helpfulCount'),
      itemType: getString('itemType', defaultValue: 'product'),
      itemName: getString('itemName'),
      userName: user != null 
          ? (user['fullName']?.toString() ?? getString('userName')) 
          : getString('userName'),
      userProfileImage: user != null 
          ? (user['profileImage']?.toString() ?? getString('userProfileImage')) 
          : getString('userProfileImage'),
      createdAt: getDateTime('createdAt') ?? DateTime.now(),
      updatedAt: getDateTime('updatedAt') ?? DateTime.now(),
      isEdited: getBool('isEdited'),
      editedAt: getDateTime('editedAt'),
      user: user,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      '_id': id,
      'userId': userId,
      'productId': productId,
      'activityId': activityId,
      'bookingId': bookingId,
      'rating': rating,
      'title': title,
      'comment': comment,
      'images': images,
      'isVerified': isVerified,
      'isApproved': isApproved,
      'helpfulCount': helpfulCount,
      'itemType': itemType,
      'itemName': itemName,
      'userName': userName,
      'userProfileImage': userProfileImage,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'isEdited': isEdited,
      'editedAt': editedAt?.toIso8601String(),
    };
  }
}