import Business from '../models/Business.js';
import { fail, ok } from '../utils/responseFormatter.js';

export async function createBusiness(req, res, next) {
  try {
    const exists = await Business.findOne({ ownerId: req.user._id });
    if (exists) {
      return fail(res, 'Business profile already exists for this account');
    }

    const payload = {
      ownerId: req.user._id,
      businessName: req.body.businessName,
      businessType: req.body.businessType,
      description: req.body.description,
      address: req.body.address,
      location: req.body.location,
      rating: req.body.rating,
      phone: req.body.phone,
      whatsappNumber: req.body.whatsappNumber,
      twilioAccountSid: req.body.twilioAccountSid,
      twilioAuthToken: req.body.twilioAuthToken,
      twilioWhatsappNumber: req.body.twilioWhatsappNumber,
      geminiApiKey: req.body.geminiApiKey,
      chatbotEnabled: req.body.chatbotEnabled ?? true,
      automationEnabled: req.body.automationEnabled ?? true,
      razorpayEnabled: req.body.razorpayEnabled ?? false,
      razorpayPaymentBaseUrl: req.body.razorpayPaymentBaseUrl
    };

    if (!payload.businessName) {
      return fail(res, 'businessName is required');
    }

    const business = await Business.create(payload);
    return ok(res, business, 'Business created', 201);
  } catch (error) {
    return next(error);
  }
}

export async function getMyBusiness(req, res, next) {
  try {
    const business = await Business.findOne({ ownerId: req.user._id });
    if (!business) {
      return fail(res, 'Business profile not found', 404);
    }
    return ok(res, business);
  } catch (error) {
    return next(error);
  }
}

export async function updateBusiness(req, res, next) {
  try {
    const business = await Business.findById(req.params.id);
    if (!business) {
      return fail(res, 'Business not found', 404);
    }
    if (req.user.role !== 'admin' && String(business.ownerId) !== String(req.user._id)) {
      return fail(res, 'Forbidden', 403);
    }

    const fields = [
      'businessName',
      'businessType',
      'description',
      'address',
      'location',
      'rating',
      'phone',
      'whatsappNumber',
      'twilioAccountSid',
      'twilioAuthToken',
      'twilioWhatsappNumber',
      'geminiApiKey',
      'chatbotEnabled',
      'automationEnabled',
      'razorpayEnabled',
      'razorpayPaymentBaseUrl'
    ];

    for (const field of fields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        business[field] = req.body[field];
      }
    }

    await business.save();
    return ok(res, business, 'Business updated');
  } catch (error) {
    return next(error);
  }
}

