import cloudinary from './cloudinary';
import type { UploadApiResponse, UploadApiOptions } from 'cloudinary';
import { appError } from '../utils/error';

/**
 * Upload a local file path or remote URL to Cloudinary.
 * @param filePath - Local path or remote URL to upload (e.g., '/tmp/image.jpg' or 'https://example.com/image.jpg')
 * @param options - Optional Cloudinary upload options
 * @returns Cloudinary upload response
 */
export async function uploadToCloudinary(
	filePath: string,
	options?: UploadApiOptions
): Promise<UploadApiResponse> {
	if (!filePath) throw new appError('filePath is required', 400);

	const result = await cloudinary.uploader.upload(filePath, options);
	return result as UploadApiResponse;
}

export default uploadToCloudinary;

/*
Example Cloudinary upload response (image). Pick the fields you need.

{
	"asset_id": "d1e2f3g4h5",
	"public_id": "samples/landscape",
	"version": 1600000000,
	"version_id": "abcdef123456",
	"signature": "abcd1234efgh5678",
	"width": 1920,
	"height": 1080,
	"format": "jpg",
	"resource_type": "image",
	"created_at": "2020-09-13T12:34:56Z",
	"tags": [],
	"bytes": 45321,
	"type": "upload",
	"etag": "etagvalue",
	"placeholder": false,
	"url": "http://res.cloudinary.com/your_cloud_name/image/upload/v1600000000/samples/landscape.jpg",
	"secure_url": "https://res.cloudinary.com/your_cloud_name/image/upload/v1600000000/samples/landscape.jpg",
	"folder": "samples",
	"original_filename": "landscape"
}

Example (raw/file/pdf):

{
	"asset_id": "x1y2z3",
	"public_id": "docs/manual",
	"resource_type": "raw",
	"format": "pdf",
	"bytes": 120045,
	"url": "http://res.cloudinary.com/your_cloud_name/raw/upload/v1600000000/docs/manual.pdf",
	"secure_url": "https://res.cloudinary.com/your_cloud_name/raw/upload/v1600000000/docs/manual.pdf"
}

If you need only the URL, use `result.secure_url`.
If you need the storage key, use `result.public_id`.
*/


