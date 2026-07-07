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
  });

  factory ReviewModel.fromJson(Map<String, dynamic> json) {
    return ReviewModel(
      id: json['_id'] ?? '',
      userId: json['userId'] ?? '',
      productId: json['productId'],
      activityId: json['activityId'],
      bookingId: json['bookingId'] ?? '',
      rating: (json['rating'] ?? 0).toDouble(),
      title: json['title'] ?? '',
      comment: json['comment'] ?? '',
      images: List<String>.from(json['images'] ?? []),
      isVerified: json['isVerified'] ?? false,
      isApproved: json['isApproved'] ?? false,
      helpfulCount: json['helpfulCount'] ?? 0,
      itemType: json['itemType'] ?? 'product',
      itemName: json['itemName'] ?? '',
      userName: json['userName'] ?? 'User',
      userProfileImage: json['userProfileImage'] ?? '',
      createdAt: DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt: DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
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
    };
  }
}