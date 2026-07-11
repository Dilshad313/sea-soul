import 'package:flutter/material.dart';
import 'package:seasoul/models/review_model.dart';
import 'package:seasoul/widgets/star_rating.dart';

class ReviewCard extends StatelessWidget {
  final ReviewModel review;
  final VoidCallback? onHelpfulTap;
  final VoidCallback? onDeleteTap;
  final VoidCallback? onEditTap;

  const ReviewCard({
    super.key,
    required this.review,
    this.onHelpfulTap,
    this.onDeleteTap,
    this.onEditTap,
  });

  @override
  Widget build(BuildContext context) {
    // ✅ Safe access with null checks
    final String userName = review.userName.isNotEmpty ? review.userName : 'User';
    final String userImage = review.userProfileImage.isNotEmpty 
        ? review.userProfileImage 
        : 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png';
    final String displayName = review.user != null 
        ? (review.user!['fullName']?.toString() ?? userName)
        : userName;

    return Container(
      padding: const EdgeInsets.all(16),
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // User info and rating
          Row(
            children: [
              // Profile image or initial
              CircleAvatar(
                radius: 18,
                backgroundColor: const Color(0xFF0099CC).withOpacity(0.1),
                backgroundImage: userImage.isNotEmpty
                    ? NetworkImage(userImage)
                    : null,
                child: userImage.isEmpty || userImage.contains('default-avatar')
                    ? Text(
                        displayName.isNotEmpty ? displayName[0].toUpperCase() : 'U',
                        style: const TextStyle(
                          color: Color(0xFF0099CC),
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      )
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      displayName,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: Color(0xFF1A2B49),
                      ),
                    ),
                    Row(
                      children: [
                        StarRating(
                          rating: review.rating,
                          size: 14,
                        ),
                        const SizedBox(width: 8),
                        if (review.isVerified)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFF00C2A8).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              '✅ Verified',
                              style: TextStyle(
                                fontSize: 9,
                                color: Color(0xFF00C2A8),
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        if (review.isEdited)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.grey.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: const Text(
                              '✏️ Edited',
                              style: TextStyle(
                                fontSize: 9,
                                color: Colors.grey,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              // ✅ Edit and Delete buttons
              if (onDeleteTap != null || onEditTap != null)
                Row(
                  children: [
                    if (onEditTap != null)
                      IconButton(
                        icon: const Icon(
                          Icons.edit, // ✅ Fixed: Use Icons.edit
                          size: 18,
                          color: Color(0xFF0099CC),
                        ),
                        onPressed: onEditTap,
                      ),
                    if (onDeleteTap != null)
                      IconButton(
                        icon: const Icon(
                          Icons.delete_outline,
                          size: 18,
                          color: Colors.red,
                        ),
                        onPressed: onDeleteTap,
                      ),
                  ],
                ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            review.title,
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1A2B49),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            review.comment,
            style: TextStyle(
              fontSize: 14,
              color: const Color(0xFF6E7880),
              fontFamily: 'Inter',
              height: 1.5,
            ),
          ),
          if (review.images.isNotEmpty) ...[
            const SizedBox(height: 10),
            SizedBox(
              height: 60,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: review.images.length,
                itemBuilder: (context, index) {
                  return Container(
                    width: 60,
                    height: 60,
                    margin: const EdgeInsets.only(right: 8),
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      image: DecorationImage(
                        image: NetworkImage(review.images[index]),
                        fit: BoxFit.cover,
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
          const SizedBox(height: 10),
          Row(
            children: [
              GestureDetector(
                onTap: onHelpfulTap,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0099CC).withOpacity(0.08),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.thumb_up_outlined,
                        size: 14,
                        color: Color(0xFF0099CC),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Helpful (${review.helpfulCount})',
                        style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF0099CC),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const Spacer(),
              Text(
                _timeAgo(review.createdAt),
                style: TextStyle(
                  fontSize: 11,
                  color: const Color(0xFF6E7880).withOpacity(0.7),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _timeAgo(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays > 30) return '${(difference.inDays / 30).floor()}mo ago';
    if (difference.inDays > 7) return '${(difference.inDays / 7).floor()}w ago';
    if (difference.inDays > 0) return '${difference.inDays}d ago';
    if (difference.inHours > 0) return '${difference.inHours}h ago';
    if (difference.inMinutes > 0) return '${difference.inMinutes}m ago';
    return 'Just now';
  }
}