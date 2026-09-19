import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

export const r2Bucket = process.env.CLOUDFLARE_R2_BUCKET ?? "sportsfair";
export const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL;

export function getR2Client() {
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("Cloudflare R2 credentials are required for media uploads.");
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey
    }
  });
}

export async function uploadToR2({
  body,
  contentType,
  key
}: {
  body: Buffer;
  contentType: string;
  key: string;
}) {
  const client = getR2Client();

  await client.send(
    new PutObjectCommand({
      Bucket: r2Bucket,
      Key: key,
      Body: body,
      ContentType: contentType
    })
  );

  if (!r2PublicUrl) {
    throw new Error("CLOUDFLARE_R2_PUBLIC_URL is required to store public media URLs.");
  }

  return `${r2PublicUrl.replace(/\/$/, "")}/${key}`;
}
