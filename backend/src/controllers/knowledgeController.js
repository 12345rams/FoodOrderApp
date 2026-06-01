import mongoose from 'mongoose';
import Business from '../models/Business.js';
import KnowledgeItem from '../models/KnowledgeItem.js';
import { fail, ok } from '../utils/responseFormatter.js';

async function resolveBusinessId(req) {
  if (req.user.role === 'admin') {
    const requested = req.query.businessId || req.body.businessId;
    if (!requested || !mongoose.Types.ObjectId.isValid(requested)) {
      return null;
    }
    return requested;
  }

  const business = await Business.findOne({ ownerId: req.user._id }).lean();
  return business?._id || null;
}

export async function listKnowledge(req, res, next) {
  try {
    const businessId = await resolveBusinessId(req);
    if (!businessId) return fail(res, 'Business profile not found', 404);

    const items = await KnowledgeItem.find({ businessId }).sort({ updatedAt: -1 });
    return ok(res, items);
  } catch (error) {
    return next(error);
  }
}

export async function createKnowledge(req, res, next) {
  try {
    const businessId = await resolveBusinessId(req);
    if (!businessId) return fail(res, 'Business profile not found', 404);

    const { title, content, tags, isActive } = req.body;
    if (!title?.trim() || !content?.trim()) {
      return fail(res, 'title and content are required');
    }

    const item = await KnowledgeItem.create({
      businessId,
      title: title.trim(),
      content: content.trim(),
      tags: Array.isArray(tags) ? tags.map((t) => String(t).trim()).filter(Boolean) : [],
      isActive: isActive !== false
    });

    return ok(res, item, 'Knowledge item created', 201);
  } catch (error) {
    return next(error);
  }
}

export async function updateKnowledge(req, res, next) {
  try {
    const businessId = await resolveBusinessId(req);
    if (!businessId) return fail(res, 'Business profile not found', 404);

    const item = await KnowledgeItem.findById(req.params.id);
    if (!item) return fail(res, 'Knowledge item not found', 404);
    if (String(item.businessId) !== String(businessId)) return fail(res, 'Forbidden', 403);

    if (Object.prototype.hasOwnProperty.call(req.body, 'title')) item.title = String(req.body.title || '').trim();
    if (Object.prototype.hasOwnProperty.call(req.body, 'content')) item.content = String(req.body.content || '').trim();
    if (Object.prototype.hasOwnProperty.call(req.body, 'isActive')) item.isActive = !!req.body.isActive;
    if (Object.prototype.hasOwnProperty.call(req.body, 'tags')) {
      item.tags = Array.isArray(req.body.tags) ? req.body.tags.map((t) => String(t).trim()).filter(Boolean) : [];
    }

    if (!item.title || !item.content) {
      return fail(res, 'title and content are required');
    }

    await item.save();
    return ok(res, item, 'Knowledge item updated');
  } catch (error) {
    return next(error);
  }
}

export async function deleteKnowledge(req, res, next) {
  try {
    const businessId = await resolveBusinessId(req);
    if (!businessId) return fail(res, 'Business profile not found', 404);

    const item = await KnowledgeItem.findById(req.params.id);
    if (!item) return fail(res, 'Knowledge item not found', 404);
    if (String(item.businessId) !== String(businessId)) return fail(res, 'Forbidden', 403);

    await item.deleteOne();
    return ok(res, null, 'Knowledge item deleted');
  } catch (error) {
    return next(error);
  }
}

