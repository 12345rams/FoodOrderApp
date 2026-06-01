import Business from '../models/Business.js';

export async function getAccessibleBusiness({ user, businessId = null }) {
  if (user.role === 'admin') {
    if (!businessId) {
      return null;
    }
    return Business.findById(businessId);
  }
  return Business.findOne({ ownerId: user._id });
}

