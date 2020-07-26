import {
  addDays,
  addSeconds,
  differenceInDays,
  endOfDay,
  startOfDay,
  startOfToday,
  subDays,
} from 'date-fns';
import { DataTypes, Model } from 'sequelize';
import { Op } from 'sequelize';
import sequelize from 'services/sequelize';

import Contact from './contact';
import Order, { OrderStatus } from './order';
import Product from './product';
// import Order, { OrderStatus } from './order';

export enum BusinessStatus {
  Trial = 'TRIAL',
  Expired = 'EXPIRED',
  Active = 'ACTIVE',
}

class Business extends Model {
  public id!: string;
  public userId!: string;
  public name!: string;
  public address!: string;
  public country!: string;
  public vat!: string;
  public readonly status!: BusinessStatus;
  public readonly daysLeft!: number;
  public readonly numberOfContactsTotal!: number;
  public readonly numberOfContactsToday!: number;
  public readonly numbersOfContactsByDate!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date | null;
}

Business.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    name: { type: DataTypes.STRING(32), allowNull: false },
    address: { type: DataTypes.STRING(64), allowNull: false },
    country: { type: DataTypes.STRING(2), allowNull: false },
    vat: { type: DataTypes.STRING(10), allowNull: false },
    daysLeft: {
      type: DataTypes.VIRTUAL,
      get(this: any) {
        return (async () => {
          const businessId = this.getDataValue('id');

          const orders = await Order.findAll({
            where: { businessId, status: OrderStatus.Paid },
            order: [['createdAt', 'DESC']],
          });

          let daysLeft = Math.max(
            differenceInDays(
              addDays(
                new Date(this.getDataValue('createdAt')),
                parseInt(process.env.FREE_TRIAL_DAYS as string),
              ),
              new Date(),
            ),
            0,
          );

          for (const order of orders) {
            const product = await Product.findOne({
              where: { id: order.productId },
            });
            const startDate = new Date(order.createdAt);
            const endDate = addSeconds(startDate, product?.time || 0);

            daysLeft += Math.max(differenceInDays(endDate, new Date()), 0);
          }

          return daysLeft;
        })();
      },
    },
    status: {
      type: DataTypes.VIRTUAL,
      get(this: any) {
        return (async () => {
          const businessId = this.getDataValue('id');

          let daysLeft = Math.max(
            differenceInDays(
              addDays(
                new Date(this.getDataValue('createdAt')),
                parseInt(process.env.FREE_TRIAL_DAYS as string),
              ),
              new Date(),
            ),
            0,
          );

          const orders = await Order.findAll({
            where: { businessId, status: OrderStatus.Paid },
            order: [['createdAt', 'DESC']],
          });

          if (daysLeft > 0 && orders.length === 0) {
            return BusinessStatus.Trial;
          }

          for (const order of orders) {
            const product = await Product.findOne({
              where: { id: order.productId },
            });
            const startDate = new Date(order.createdAt);
            const endDate = addSeconds(startDate, product?.time || 0);

            daysLeft += Math.max(differenceInDays(endDate, new Date()), 0);
          }

          if (daysLeft > 0) {
            return BusinessStatus.Active;
          }

          return BusinessStatus.Expired;
        })();
      },
    },
    numberOfContactsTotal: {
      type: DataTypes.VIRTUAL,
      get(this: any) {
        const businessId = this.getDataValue('id');

        return Contact.count({ where: { businessId } });
      },
    },
    numberOfContactsToday: {
      type: DataTypes.VIRTUAL,
      get(this: any) {
        const businessId = this.getDataValue('id');

        return Contact.count({
          where: {
            businessId,
            createdAt: {
              [Op.gte]: startOfToday(),
            },
          },
        });
      },
    },
    numberOfContactsByDate: {
      type: DataTypes.VIRTUAL,
      get(this: any) {
        return (async () => {
          const businessId = this.getDataValue('id');

          const data: { [key: string]: number } = {};
          for (let i = 0; i < 14; i++) {
            const date = subDays(new Date(), i);
            const startDate = startOfDay(date);
            const endDate = endOfDay(date);

            const count = await Contact.count({
              where: {
                businessId,
                createdAt: {
                  [Op.gte]: startDate,
                  [Op.lte]: endDate,
                },
              },
            });

            data[`${startDate.getTime()}`] = count;
          }

          return data;
        })();
      },
    },
  },
  {
    sequelize,
    tableName: 'businesses',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['name'],
      },
    ],
  },
);

Business.hasMany(Contact, {
  as: 'contacts',
  constraints: false,
  foreignKey: 'businessId',
});

export default Business;
