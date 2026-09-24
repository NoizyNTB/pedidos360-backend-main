const { z } = require('zod');

// La key la genera el backend en createImageUploadUrl: products/<uuid>.<jpg|png|webp>
// Validarla evita que alguien apunte un producto a un objeto arbitrario del bucket.
const IMAGE_KEY_REGEX =
  /^products\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$/;

const createProductSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  category: z.string().optional(),
  imageKey: z.string().regex(IMAGE_KEY_REGEX, 'imageKey inválida').optional(),
});

const updateProductSchema = createProductSchema.partial();

// Body que espera POST /api/catalog/images/upload-url. `fileName` es solo
// informativo (no se usa para armar la key, así se evita cualquier problema
// de sanitización de nombres de archivo).
const IMAGE_CONTENT_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

const imageUploadRequestSchema = z.object({
  contentType: z.enum(Object.keys(IMAGE_CONTENT_TYPES)),
  fileName: z.string().optional(),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  imageUploadRequestSchema,
  IMAGE_CONTENT_TYPES,
};