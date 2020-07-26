import createMollieClient from '@mollie/api-client';
import Business from 'models/business';
import Order, { OrderStatus } from 'models/order';
import Product from 'models/product';
import { GraphqlContext } from 'server';
import { v4 as uuidv4 } from 'uuid';

const mollieClient = createMollieClient({
  apiKey: process.env.MOLLIE_API_KEY as string,
});

const createPayment = async (
  _parent: any,
  { productId, businessId }: { productId: string; businessId: string },
  context: GraphqlContext,
) => {
  const { user } = context;

  if (!user) {
    throw new Error('not authenticated');
  }

  const business = await Business.findOne({ where: { id: businessId } });
  if (!business) {
    throw new Error('invalid business');
  }

  if (business.userId !== user.id) {
    throw new Error('no permissions');
  }

  const product = await Product.findOne({ where: { id: productId } });
  if (!product) {
    throw new Error('invalid product');
  }

  const orderId = uuidv4();
  const molliePaymentOrder = await mollieClient.payments.create({
    amount: {
      value: `${product.value}`,
      currency: product.currency,
    },
    description: product.description,
    redirectUrl: `${process.env.API_URL}/payments/${orderId}`,
    metadata: {
      productId,
      orderId,
    },
  });

  const externalReference = molliePaymentOrder.id;
  const externalPaymentLink = molliePaymentOrder?._links?.checkout?.href;

  const order = await Order.create(
    {
      id: orderId,
      userId: user.id,
      businessId,
      productId,
      status: OrderStatus.Pending,
      externalReference,
      externalPaymentLink,
    },
    { include: [{ all: true, nested: true }] },
  );

  // fetch related models
  await order.reload();

  return order;
};

export default {
  createPayment,
};
