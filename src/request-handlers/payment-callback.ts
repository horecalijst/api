import { Request, Response } from 'express';
import Order, { OrderStatus } from 'models/order';
import Mollie from 'services/mollie';

export default async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { id: externalReference } = req.body;

  try {
    const payment = await Mollie.payments.get(externalReference);

    if (!payment) {
      res.sendStatus(404);
      return;
    }

    const order = await Order.findOne({ where: { id: orderId } });
    if (!order) {
      res.sendStatus(404);
      return;
    }

    switch (payment.status) {
      case 'open':
      case 'pending':
        order.status = OrderStatus.Pending;
        break;
      case 'expired':
        order.status = OrderStatus.Expired;
        break;
      case 'paid':
        order.status = OrderStatus.Paid;
        break;
      case 'canceled':
        order.status = OrderStatus.Canceled;
        break;
      case 'failed':
        order.status = OrderStatus.Failed;
        break;
    }

    await order.save();

    res.sendStatus(204);
  } catch {
    res.sendStatus(500);
  }
};
