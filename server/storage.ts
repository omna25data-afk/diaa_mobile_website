import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { ENV } from "./_core/env";

function normalizeKey(relKey: string) {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string) {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const index = relKey.lastIndexOf(".");
  return index === -1 ? `${relKey}_${hash}` : `${relKey.slice(0, index)}_${hash}${relKey.slice(index)}`;
}

function storageConfig() {
  if (!ENV.s3Bucket || !ENV.s3AccessKeyId || !ENV.s3SecretAccessKey || !ENV.mediaPublicBaseUrl) {
    throw new Error("S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY and MEDIA_PUBLIC_BASE_URL are required for media uploads.");
  }
  return {
    client: new S3Client({
      region: ENV.s3Region,
      endpoint: ENV.s3Endpoint || undefined,
      forcePathStyle: Boolean(ENV.s3Endpoint),
      credentials: { accessKeyId: ENV.s3AccessKeyId, secretAccessKey: ENV.s3SecretAccessKey },
    }),
    bucket: ENV.s3Bucket,
    publicBaseUrl: ENV.mediaPublicBaseUrl.replace(/\/+$/, ""),
  };
}

export async function storagePut(relKey: string, data: Buffer | Uint8Array | string, contentType = "application/octet-stream") {
  const { client, bucket, publicBaseUrl } = storageConfig();
  const key = appendHashSuffix(normalizeKey(relKey));
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: data, ContentType: contentType }));
  return { key, url: `${publicBaseUrl}/${key}` };
}

export async function storageGet(relKey: string) {
  const key = normalizeKey(relKey);
  return { key, url: `${ENV.mediaPublicBaseUrl.replace(/\/+$/, "")}/${key}` };
}
