import { randomUUID } from 'node:crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// POST /api/catalog/images/upload-url
// Body:     { contentType: 'image/png', fileName?: 'foto.png' }
// Respuesta: { uploadUrl, key, expiresIn }
// El navegador sube el archivo directo a S3 con `uploadUrl` (PUT) y luego guarda `key` en el producto.

const s3 = new S3Client({});

const EXTENSIONS = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const EXPIRES_IN = 300; // segundos que dura la URL prefirmada

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

export const handler = async (event) => {
  let body;
  try {
    body = JSON.parse(event.body ?? '{}');
  } catch {
    return json(400, { message: 'El cuerpo de la petición no es un JSON válido.' });
  }

  const extension = EXTENSIONS[body.contentType];
  if (!extension) {
    return json(400, { message: 'Formato no permitido. Usa JPG, PNG o WebP.' });
  }

  // La key la genera el servidor (nunca el cliente) para evitar sobrescrituras o rutas raras.
  const key = `products/${randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.IMAGES_BUCKET,
    Key: key,
    ContentType: body.contentType, // queda firmado: el PUT debe enviar exactamente este Content-Type
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: EXPIRES_IN });
  return json(200, { uploadUrl, key, expiresIn: EXPIRES_IN });
};