import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import '../services/api_service.dart';
import '../constants/api_constants.dart';

class EditProfilePage extends StatefulWidget {
  final Map<String, dynamic> userData;

  const EditProfilePage({super.key, required this.userData});

  @override
  State<EditProfilePage> createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  final _fullNameController = TextEditingController();
  final _phoneController = TextEditingController();
  final _bioController = TextEditingController();
  final _locationController = TextEditingController();

  String _profileImage = '';
  bool _isLoading = false;
  bool _isImageLoading = false;

  // Store original values to check changes
  Map<String, dynamic> _originalData = {};

  // Cloudinary configuration
  final String _cloudinaryCloudName = 'eeua8tfb';
  final String _uploadPreset = 'seasoul_profiles';

  static const Color deepNavy = Color(0xFF1A2B49);
  static const Color oceanBlue = Color(0xFF0099CC);
  static const Color outline = Color(0xFF6E7880);
  static const Color sandWhite = Color(0xFFF8FBFF);

  @override
  void initState() {
    super.initState();

    _originalData = {
      'fullName': widget.userData['fullName'] ?? '',
      'phone': widget.userData['phone'] ?? '',
      'bio': widget.userData['bio'] ?? '',
      'location': widget.userData['location'] ?? '',
    };

    _fullNameController.text = _originalData['fullName'];
    _phoneController.text = _originalData['phone'];
    _bioController.text = _originalData['bio'];
    _locationController.text = _originalData['location'];
    _profileImage =
        widget.userData['profileImage'] ??
        'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png';
  }

  @override
  void dispose() {
    _fullNameController.dispose();
    _phoneController.dispose();
    _bioController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  bool _hasChanges() {
    final currentFullName = _fullNameController.text.trim();
    final currentPhone = _phoneController.text.trim();
    final currentBio = _bioController.text.trim();
    final currentLocation = _locationController.text.trim();

    return currentFullName != _originalData['fullName'] ||
        currentPhone != _originalData['phone'] ||
        currentBio != _originalData['bio'] ||
        currentLocation != _originalData['location'];
  }

  // Convert XFile to bytes
  Future<Uint8List> _fileToBytes(XFile file) async {
    return await file.readAsBytes();
  }

  // Upload to Cloudinary - Works on all platforms
  Future<String> _uploadToCloudinary(Uint8List imageBytes) async {
    try {
      print('📤 Uploading to Cloudinary...');

      // Create multipart request
      var request = http.MultipartRequest(
        'POST',
        Uri.parse(
          'https://api.cloudinary.com/v1_1/$_cloudinaryCloudName/image/upload',
        ),
      );

      // Add fields
      request.fields['upload_preset'] = _uploadPreset;
      request.fields['folder'] = 'seasoul/profiles';

      // Add file
      request.files.add(
        http.MultipartFile.fromBytes(
          'file',
          imageBytes,
          filename: 'profile_image.jpg',
          contentType: http.MediaType('image', 'jpeg'),
        ),
      );

      // Send request
      final response = await request.send();
      final responseData = await response.stream.toBytes();
      final responseString = utf8.decode(responseData);

      print('📥 Cloudinary Response: $responseString');

      final Map<String, dynamic> responseMap = jsonDecode(responseString);

      if (responseMap['secure_url'] != null) {
        return responseMap['secure_url'];
      } else {
        throw Exception(responseMap['error']?['message'] ?? 'Upload failed');
      }
    } catch (e) {
      print('❌ Cloudinary upload error: $e');
      throw Exception('Failed to upload: $e');
    }
  }

  Future<void> _pickImage() async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 800,
        maxHeight: 800,
        imageQuality: 70,
      );

      if (image != null) {
        setState(() {
          _isImageLoading = true;
        });

        print('📤 Image selected: ${image.name}');

        // Convert to bytes (works on all platforms)
        Uint8List imageBytes = await _fileToBytes(image);
        print('📤 Image size: ${imageBytes.length} bytes');

        // Upload to Cloudinary
        final String imageUrl = await _uploadToCloudinary(imageBytes);
        print('✅ Cloudinary URL: $imageUrl');

        // Save URL to backend
        final response = await ApiService.postWithToken(
          ApiConstants.uploadProfileImage,
          {'image': imageUrl},
        );

        print('📥 Backend Response: $response');

        if (response['success'] == true) {
          setState(() {
            _profileImage = response['profileImage'] ?? imageUrl;
            _isImageLoading = false;
          });

          // Update user data
          final userData = await ApiService.getUserData();
          if (userData != null) {
            userData['profileImage'] = _profileImage;
            await ApiService.saveUserData(userData);

            // Update original data
            _originalData['profileImage'] = _profileImage;
          }

          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('✅ Profile image updated successfully'),
              backgroundColor: Colors.green,
            ),
          );
        } else {
          throw Exception(response['message'] ?? 'Upload failed');
        }
      }
    } catch (e) {
      setState(() {
        _isImageLoading = false;
      });
      print('❌ Error: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  // Remove image
  Future<void> _removeImage() async {
    try {
      setState(() => _isImageLoading = true);

      final response = await ApiService.deleteWithToken(
        ApiConstants.deleteProfileImage,
      );

      if (response['success'] == true) {
        setState(() {
          _profileImage =
              'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png';
          _isImageLoading = false;
        });

        final userData = await ApiService.getUserData();
        if (userData != null) {
          userData['profileImage'] = _profileImage;
          await ApiService.saveUserData(userData);
        }

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Profile image removed'),
            backgroundColor: Colors.green,
          ),
        );
      } else {
        throw Exception(response['message'] ?? 'Failed to remove image');
      }
    } catch (e) {
      setState(() => _isImageLoading = false);
      print('❌ Error removing image: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  Future<void> _saveProfile() async {
    if (!_hasChanges()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('No changes to save'),
          backgroundColor: Colors.orange,
          duration: Duration(seconds: 2),
        ),
      );
      Navigator.pop(context);
      return;
    }

    setState(() => _isLoading = true);

    try {
      final data = {
        'fullName': _fullNameController.text.trim(),
        'phone': _phoneController.text.trim(),
        'bio': _bioController.text.trim(),
        'location': _locationController.text.trim(),
      };

      final response = await ApiService.putWithToken(
        ApiConstants.profile,
        data,
      );

      if (response['success'] == true) {
        await ApiService.saveUserData(response['user']);

        _originalData = {
          'fullName': response['user']['fullName'] ?? '',
          'phone': response['user']['phone'] ?? '',
          'bio': response['user']['bio'] ?? '',
          'location': response['user']['location'] ?? '',
        };

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Profile updated successfully'),
            backgroundColor: Colors.green,
          ),
        );

        Navigator.pop(context, true);
      } else {
        throw Exception(response['message'] ?? 'Update failed');
      }
    } catch (e) {
      print('❌ Error saving profile: $e');
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error: ${e.toString()}'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool hasImage =
        _profileImage.isNotEmpty &&
        _profileImage !=
            'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png';
    final String initial = _fullNameController.text.isNotEmpty
        ? _fullNameController.text[0].toUpperCase()
        : 'U';

    final bool hasChanges = _hasChanges();

    return Scaffold(
      backgroundColor: sandWhite,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: deepNavy),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Edit Profile',
          style: TextStyle(
            color: deepNavy,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          TextButton(
            onPressed: (_isLoading || !hasChanges) ? null : _saveProfile,
            child: Text(
              _isLoading ? 'Saving...' : 'Save',
              style: TextStyle(
                color: (_isLoading || !hasChanges) ? Colors.grey : oceanBlue,
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Profile Image
            Stack(
              alignment: Alignment.bottomRight,
              children: [
                Container(
                  width: 120,
                  height: 120,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: Colors.grey[200],
                    image: hasImage
                        ? DecorationImage(
                            image: NetworkImage(_profileImage),
                            fit: BoxFit.cover,
                            onError: (exception, stackTrace) {
                              print('❌ Profile image load error: $exception');
                            },
                          )
                        : null,
                    border: Border.all(color: oceanBlue, width: 3),
                  ),
                  child: !hasImage
                      ? Text(
                          initial,
                          style: const TextStyle(
                            fontSize: 48,
                            fontWeight: FontWeight.bold,
                            color: oceanBlue,
                          ),
                        )
                      : null,
                ),
                if (_isImageLoading)
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.black.withOpacity(0.5),
                      ),
                      child: const Center(
                        child: SizedBox(
                          width: 30,
                          height: 30,
                          child: CircularProgressIndicator(color: Colors.white),
                        ),
                      ),
                    ),
                  ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      GestureDetector(
                        onTap: _pickImage,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: const BoxDecoration(
                            color: oceanBlue,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.camera_alt,
                            color: Colors.white,
                            size: 20,
                          ),
                        ),
                      ),
                      if (hasImage) const SizedBox(width: 8),
                      if (hasImage)
                        GestureDetector(
                          onTap: _removeImage,
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: const BoxDecoration(
                              color: Colors.red,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.delete,
                              color: Colors.white,
                              size: 20,
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Full Name
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Full Name',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: outline,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[300]!),
                  ),
                  child: TextField(
                    controller: _fullNameController,
                    style: const TextStyle(color: deepNavy),
                    onChanged: (_) => setState(() {}),
                    decoration: const InputDecoration(
                      hintText: 'Enter your full name',
                      hintStyle: TextStyle(color: Colors.grey),
                      prefixIcon: Icon(Icons.person_outline, color: oceanBlue),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(
                        vertical: 16,
                        horizontal: 16,
                      ),
                      errorText: null,
                      errorBorder: InputBorder.none,
                      focusedErrorBorder: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Phone
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Phone Number',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: outline,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[300]!),
                  ),
                  child: TextField(
                    controller: _phoneController,
                    style: const TextStyle(color: deepNavy),
                    keyboardType: TextInputType.phone,
                    onChanged: (_) => setState(() {}),
                    decoration: const InputDecoration(
                      hintText: 'Enter your phone number',
                      hintStyle: TextStyle(color: Colors.grey),
                      prefixIcon: Icon(Icons.phone_outlined, color: oceanBlue),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(
                        vertical: 16,
                        horizontal: 16,
                      ),
                      errorText: null,
                      errorBorder: InputBorder.none,
                      focusedErrorBorder: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Location
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Location',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: outline,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[300]!),
                  ),
                  child: TextField(
                    controller: _locationController,
                    style: const TextStyle(color: deepNavy),
                    onChanged: (_) => setState(() {}),
                    decoration: const InputDecoration(
                      hintText: 'Enter your location',
                      hintStyle: TextStyle(color: Colors.grey),
                      prefixIcon: Icon(
                        Icons.location_on_outlined,
                        color: oceanBlue,
                      ),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(
                        vertical: 16,
                        horizontal: 16,
                      ),
                      errorText: null,
                      errorBorder: InputBorder.none,
                      focusedErrorBorder: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Bio
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Bio',
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: outline,
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[300]!),
                  ),
                  child: TextField(
                    controller: _bioController,
                    style: const TextStyle(color: deepNavy),
                    maxLines: 4,
                    maxLength: 500,
                    onChanged: (_) => setState(() {}),
                    decoration: const InputDecoration(
                      hintText: 'Tell us about yourself',
                      hintStyle: TextStyle(color: Colors.grey),
                      prefixIcon: Icon(
                        Icons.description_outlined,
                        color: oceanBlue,
                      ),
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(
                        vertical: 16,
                        horizontal: 16,
                      ),
                      errorText: null,
                      errorBorder: InputBorder.none,
                      focusedErrorBorder: InputBorder.none,
                      enabledBorder: InputBorder.none,
                      focusedBorder: InputBorder.none,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),

            // Save Button
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton(
                onPressed: (_isLoading || !hasChanges) ? null : _saveProfile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: hasChanges ? oceanBlue : Colors.grey,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                child: _isLoading
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: Colors.white,
                        ),
                      )
                    : Text(
                        hasChanges ? 'Save Changes' : 'No Changes',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),

            const SizedBox(height: 16),

            if (!hasChanges && !_isLoading)
              const Text(
                'Make changes to enable save',
                style: TextStyle(color: Colors.grey, fontSize: 12),
              ),
          ],
        ),
      ),
    );
  }
}
