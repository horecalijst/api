import { DataTypes, Model } from 'sequelize';
import sequelize from 'services/sequelize';

export enum OrderStatus {
  Pending = 'PENDING',
  Paid = 'PAID',
  Canceled = 'CANCELED',
  Granted = 'GRANTED',
}

class Order extends Model {
  public id!: string;
  public userId!: string;
  public businessId!: string;
  public productId!: string;
  public externalReference!: string;
  public externalPaymentLink!: string;
  public status!: OrderStatus;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date | null;
}

Order.init(
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
    businessId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    productId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    externalReference: { type: DataTypes.STRING(16), allowNull: false },
    externalPaymentLink: { type: DataTypes.STRING(128), allowNull: false },
    status: {
      type: DataTypes.ENUM(
        OrderStatus.Pending,
        OrderStatus.Paid,
        OrderStatus.Canceled,
        OrderStatus.Granted,
      ),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'orders',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['userId'],
      },
      {
        fields: ['businessId'],
      },
      {
        fields: ['productId'],
      },
      {
        fields: ['externalReference'],
      },
      {
        fields: ['status'],
      },
    ],
  },
);

export default Order;
