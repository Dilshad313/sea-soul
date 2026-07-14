import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../services/api_service.dart';
import '../constants/api_constants.dart';

// ✅ Web-specific imports
// ignore: avoid_web_libraries_in_flutter
import 'dart:html' as html;

class EditProfilePage extends StatefulWidget {
  final Map<String, dynamic> userData;

  const EditProfilePage({
    super.key,
    required this.userData,
  });

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

  // ✅ Cloudinary configuration
  final String _cloudinaryCloudName = 'eeua8tfb'; // Replace with your cloud name
  final String _uploadPreset = 'seasoul_profiles';

  static const Color deepNavy = Color(0xFF1A2B49);
  static const Color oceanBlue = Color(0xFF0099CC);
  static const Color outline = Color(0xFF6E7880);
  static const Color sandWhite = Color(0xFFF8FBFF);

  @override
  void initState() {
    super.initState();
    _fullNameController.text = widget.userData['fullName'] ?? '';
    _phoneController.text = widget.userData['phone'] ?? '';
    _bioController.text = widget.userData['bio'] ?? '';
    _locationController.text = widget.userData['location'] ?? '';
    _profileImage = widget.userData['profileImage'] ?? 
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

  // ✅ Convert XFile to base64
  Future<String> _fileToBase64(XFile file) async {
    final bytes = await file.readAsBytes();
    return base64Encode(bytes);
  }

  // ✅ Upload to Cloudinary - Simple and Reliable
  Future<String> _uploadToCloudinary(String base64Image) async {
    try {
      print('📤 Uploading to Cloudinary...');
      
      // ✅ Clean base64 string (remove data:image/jpeg;base64, prefix)
      String cleanBase64 = base64Image;
      if (base64Image.contains(',')) {
        cleanBase64 = base64Image.split(',').last;
      }
      
      // ✅ Create FormData - SIMPLE METHOD
      final html.FormData formData = html.FormData();
      
      // ✅ Directly append base64 string as file (No blob needed!)
      formData.append('file', 'data:image/jpeg;base64,$cleanBase64');
      formData.append('upload_preset', _uploadPreset);
      formData.append('folder', 'seasoul/profiles');
      
      // ✅ Send request
      final html.HttpRequest request = await html.HttpRequest.request(
        'https://api.cloudinary.com/v1_1/$_cloudinaryCloudName/image/upload',
        method: 'POST',
        sendData: formData,
      );
      
      final Map<String, dynamic> responseData = jsonDecode(request.responseText ?? '{}');
      
      print('📥 Cloudinary Response: $responseData');
      
      if (responseData['secure_url'] != null) {
        return responseData['secure_url'];
      } else {
        throw Exception(responseData['error']?['message'] ?? 'Upload failed');
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
        
        // ✅ Get base64 string
        String base64String = await _fileToBase64(image);
        print('📤 Base64 length: ${base64String.length}');
        
        // ✅ Upload to Cloudinary directly
        final String imageUrl = await _uploadToCloudinary(base64String);
        print('✅ Cloudinary URL: $imageUrl');
        
        // ✅ Save URL to backend
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
          
          // ✅ Update user data
          final userData = await ApiService.getUserData();
          if (userData != null) {
            userData['profileImage'] = _profileImage;
            await ApiService.saveUserData(userData);
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

  // ✅ Remove image
  Future<void> _removeImage() async {
    try {
      setState(() => _isImageLoading = true);
      
      final response = await ApiService.deleteWithToken(ApiConstants.deleteProfileImage);
      
      if (response['success'] == true) {
        setState(() {
          _profileImage = 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png';
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
    setState(() => _isLoading = true);

    try {
      final data = {
        'fullName': _fullNameController.text.trim(),
        'phone': _phoneController.text.trim(),
        'bio': _bioController.text.trim(),
        'location': _locationController.text.trim(),
      };

      final response = await ApiService.putWithToken(ApiConstants.profile, data);
      
      if (response['success'] == true) {
        await ApiService.saveUserData(response['user']);
        
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
    final bool hasImage = _profileImage.isNotEmpty && 
                          _profileImage != 'https://res.cloudinary.com/demo/image/upload/v1/default-avatar.png';
    final String initial = _fullNameController.text.isNotEmpty 
        ? _fullNameController.text[0].toUpperCase() 
        : 'U';

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
            onPressed: _isLoading ? null : _saveProfile,
            child: Text(
              _isLoading ? 'Saving...' : 'Save',
              style: TextStyle(
                color: _isLoading ? outline : oceanBlue,
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
                    border: Border.all(
                      color: oceanBlue,
                      width: 3,
                    ),
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
                          child: CircularProgressIndicator(
                            color: Colors.white,
                          ),
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
                    decoration: const InputDecoration(
                      hintText: 'Enter your location',
                      hintStyle: TextStyle(color: Colors.grey),
                      prefixIcon: Icon(Icons.location_on_outlined, color: oceanBlue),
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
                    decoration: const InputDecoration(
                      hintText: 'Tell us about yourself',
                      hintStyle: TextStyle(color: Colors.grey),
                      prefixIcon: Icon(Icons.description_outlined, color: oceanBlue),
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
                onPressed: _isLoading ? null : _saveProfile,
                style: ElevatedButton.styleFrom(
                  backgroundColor: oceanBlue,
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
                    : const Text(
                        'Save Changes',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}