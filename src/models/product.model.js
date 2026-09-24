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

module.exports = { createProductSchema, updateProductSchema };