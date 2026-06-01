import Order from '../models/Order.js';
import Product from '../models/Product.js';

export async function createOrderFromSession({ businessId, customer, session }) {
  const items = session.selectedItems || [];
  if (items.length === 0) {
    throw new Error('No items selected for the order');
  }

  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findOne({
      _id: item.productId,
      businessId,
      isActive: true
    });

    if (!product) {
      throw new Error(`Product ${item.productName} is no longer available`);
    }

    const quantity = Number(item.quantity || 1);
    if (quantity < 1 || quantity > product.stock) {
      throw new Error(`Insufficient stock for ${item.productName}`);
    }

    orderItems.push({
      productId: product._id,
      productName: product.name,
      quantity,
      price: product.price
    });
    totalAmount += quantity * product.price;

    product.stock = Math.max(product.stock - quantity, 0);
    await product.save();
  }

  const order = await Order.create({
    businessId,
    customerId: customer._id,
    whatsappNumber: customer.whatsappNumber,
    items: orderItems,
    totalAmount,
    address: session.address,
    status: 'pending',
    paymentStatus: 'pending'
  });

  return order;
}

