import { config as dotenvConfig } from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenvConfig();

const cloudName = process.env.cloudinary_api_name;
const apiKey = process.env.cloudinary_api_key;
const apiSecret = process.env.cloudinary_api_secret;

if (!cloudName || !apiKey || !apiSecret) {
	console.warn(
		'Cloudinary env vars missing. Please set cloudinary_api_name, cloudinary_api_key, cloudinary_api_secret in your .env'
	);
}

cloudinary.config({
	cloud_name: cloudName,
	api_key: apiKey,
	api_secret: apiSecret,
	secure: true,
});

export default cloudinary;

