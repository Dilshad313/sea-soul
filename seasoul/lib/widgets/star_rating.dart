import 'package:flutter/material.dart';

class StarRating extends StatelessWidget {
  final double rating;
  final double size;
  final Color activeColor;
  final Color inactiveColor;
  final bool showNumber;
  final int starCount;

  const StarRating({
    super.key,
    required this.rating,
    this.size = 20,
    this.activeColor = const Color(0xFFFFB84D),
    this.inactiveColor = Colors.grey,
    this.showNumber = false,
    this.starCount = 5,
  });

  @override
  Widget build(BuildContext context) {
    final fullStars = rating.floor();
    final hasHalfStar = rating - fullStars >= 0.5;

    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ...List.generate(fullStars, (index) {
          return Icon(
            Icons.star,
            color: activeColor,
            size: size,
          );
        }),
        if (hasHalfStar)
          Icon(
            Icons.star_half,
            color: activeColor,
            size: size,
          ),
        ...List.generate(starCount - fullStars - (hasHalfStar ? 1 : 0), (index) {
          return Icon(
            Icons.star_border,
            color: inactiveColor,
            size: size,
          );
        }),
        if (showNumber)
          Padding(
            padding: const EdgeInsets.only(left: 4),
            child: Text(
              rating.toStringAsFixed(1),
              style: TextStyle(
                fontSize: size * 0.8,
                fontWeight: FontWeight.bold,
                color: activeColor,
              ),
            ),
          ),
      ],
    );
  }
}