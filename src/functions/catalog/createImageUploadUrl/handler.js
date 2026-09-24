const { v4: uuidv4 } = require('uuid');
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { success } = require('../../../libs/utils/response');
const { withErrorHandler } = require('../../../libs/middlewares/errorHandler');
const { imageUploadRequestSchema, IMAGE_CONTENT_TYPES } = require('../../../models/product.model');
const { requireRoles } = require('../../../libs/middlewares/requireRoles');
const PERMISSIONS = require('../../../libs/constants/permissions');

const s3 = new S3Client({});
const UPLOAD_EXPIRES_IN = 300; // 5 minutos para completar el PUT a S3

// Genera una URL prefirmada de S3 para que el frontend suba la imagen
// DIRECTO al bucket (sin pasar el binario por esta Lambda). La key la
// decide el backend (no el cliente), así nadie puede pisar el objeto de
// otro producto ni escribir fuera de `products/`.
const handler = async (event) => {
  const body = JSON.parse(event.body || '{}');
  const { contentType } = imageUploadRequestSchema.parse(body);

  const extension = IMAGE_CONTENT_TYPES[contentType];
  const key = `products/${uuidv4()}.${extension}`;

  const uploadUrl = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: process.env.IMAGES_BUCKET, Key: key, ContentType: contentType }),
    { expiresIn: UPLOAD_EXPIRES_IN }
  );

  return success({ uploadUrl, key }, 201);
};

module.exports = { handler: withErrorHandler(requireRoles(...PERMISSIONS.catalog.create)(handler)) };