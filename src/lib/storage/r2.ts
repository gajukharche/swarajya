import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || 'mock_account_id';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || 'mock_access_key';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || 'mock_secret_key';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'storefront-assets';
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || 'https://pub-mock.r2.dev';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export interface PresignedUrlResult {
  uploadUrl: string;
  publicUrl: string;
  fileKey: string;
}

export async function createPresignedUploadUrl(
  filename: string,
  contentType: string,
  prefix: string = 'catalog'
): Promise<PresignedUrlResult> {
  const timestamp = Date.now();
  const sanitizedName = filename.toLowerCase().replace(/[^a-z0-9.-]/g, '-');
  const fileKey = `${prefix}/${timestamp}-${sanitizedName}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });
  const publicUrl = `${R2_PUBLIC_DOMAIN}/${fileKey}`;

  return { uploadUrl, publicUrl, fileKey };
}
