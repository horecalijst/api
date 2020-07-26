import Product from 'models/product';
import { GraphqlContext } from 'server';

const products = async (_parent: any, _args: any, context: GraphqlContext) => {
  const { user } = context;

  if (!user) {
    throw new Error('not authenticated');
  }

  return Product.findAll({ order: [['price', 'ASC']] });
};

export default {
  products,
};
