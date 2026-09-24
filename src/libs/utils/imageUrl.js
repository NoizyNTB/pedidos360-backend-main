const { GetObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const logger = require('./logger');

const s3 = new S3Client({});
const EXPIRES_IN = 3600; // segundos que dura la URL de lectura

// Agrega `imageUrl` (URL prefirmada de lectura) a un producto que tenga `imageKey`.
// El bucket es privado: la URL se genera al vuelo y nunca se guarda en la base de datos.
// Si falla la firma, el producto se devuelve igual (sin imagen) para no romper el catálogo.
const withImageUrl = async (product) => {
  if (!product || !product.imageKey) return product;
  try {
    const imageUrl = await getSignedUrl(
      s3,
      new GetObjectCommand({ Bucket: process.env.IMAGES_BUCKET, Key: product.imageKey }),
      { expiresIn: EXPIRES_IN }
    );
    return { ...product, imageUrl };
  } catch (err) {
    logger.error('No se pudo firmar la URL de la imagen', { message: err.message, key: product.imageKey });
    return product;
  }
};

const withImageUrls = (products) => Promise.all(products.map(withImageUrl));

module.exports = { withImageUrl, withImageUrls };