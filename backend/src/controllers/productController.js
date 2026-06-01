import Product from '../models/Product.js';
import Business from '../models/Business.js';
import { fail, ok } from '../utils/responseFormatter.js';

async function getBusinessIdForUser(user) {
  if (user.role === 'admin') {
    return null;
  }
  const business = await Business.findOne({ ownerId: user._id }).lean();
  return business?._id || null;
}

export async function createProduct(req, res, next) {
  try {
    const businessId = await getBusinessIdForUser(req.user);
    if (!businessId) {
      return fail(res, 'Business profile required before adding products', 400);
    }

    const payload = {
      businessId,
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      price: req.body.price,
      stock: req.body.stock,
      imageUrl: req.body.imageUrl,
      isActive: req.body.isActive ?? true
    };

    if (!payload.name || payload.price == null) {
      return fail(res, 'name and price are required');
    }

    const product = await Product.create(payload);
    return ok(res, product, 'Product created', 201);
  } catch (error) {
    return next(error);
  }
}

export async function listProducts(req, res, next) {
  try {
    const businessId = await getBusinessIdForUser(req.user);
    if (!businessId) {
      return fail(res, 'Business profile not found', 404);
    }
    const products = await Product.find({ businessId }).sort({ createdAt: -1 });
    return ok(res, products);
  } catch (error) {
    return next(error);
  }
}

export async function getProductById(req, res, next) {
  try {
    const businessId = await getBusinessIdForUser(req.user);
    const product = await Product.findById(req.params.id);
    if (!product) {
      return fail(res, 'Product not found', 404);
    }
    if (businessId && String(product.businessId) !== String(businessId)) {
      return fail(res, 'Forbidden', 403);
    }
    return ok(res, product);
  } catch (error) {
    return next(error);
  }
}

export async function updateProduct(req, res, next) {
  try {
    const businessId = await getBusinessIdForUser(req.user);
    const product = await Product.findById(req.params.id);
    if (!product) {
      return fail(res, 'Product not found', 404);
    }
    if (businessId && String(product.businessId) !== String(businessId)) {
      return fail(res, 'Forbidden', 403);
    }

    ['name', 'description', 'category', 'price', 'stock', 'imageUrl', 'isActive'].forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        product[field] = req.body[field];
      }
    });

    await product.save();
    return ok(res, product, 'Product updated');
  } catch (error) {
    return next(error);
  }
}

export async function deleteProduct(req, res, next) {
  try {
    const businessId = await getBusinessIdForUser(req.user);
    const product = await Product.findById(req.params.id);
    if (!product) {
      return fail(res, 'Product not found', 404);
    }
    if (businessId && String(product.businessId) !== String(businessId)) {
      return fail(res, 'Forbidden', 403);
    }
    await product.deleteOne();
    return ok(res, null, 'Product deleted');
  } catch (error) {
    return next(error);
  }
}

