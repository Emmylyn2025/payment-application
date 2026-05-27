import uploadToCloudinary from '../cloudinary/cloudinaryService';

async function uploadVideoCloudinary(filePath: string, userId: string) {
  const result = await uploadToCloudinary(filePath, {
    resource_type: 'video',
    folder: 'videos',
    public_id: `video_${userId}_${Date.now()}`,
    overwrite: true,
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    duration: result.duration,
  };
}

export { uploadVideoCloudinary };