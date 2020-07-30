import { DataTypes, Model } from 'sequelize';
import sequelize from 'services/sequelize';

export enum ProductPeriod {
  Monthly = 'MONTHLY',
  Quarterly = 'QUARTERLY',
  Yearly = 'YEARLY',
}

export enum ProductCurrency {
  Euro = 'EUR',
}

class Product extends Model {
  public id!: string;
  public description!: string;
  public period!: ProductPeriod;
  public time!: number;
  public currency!: ProductCurrency;
  public value!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date | null;
}

Product.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    description: { type: DataTypes.STRING(16), allowNull: false },
    period: {
      type: DataTypes.ENUM(
        ProductPeriod.Monthly,
        ProductPeriod.Quarterly,
        ProductPeriod.Yearly,
      ),
      allowNull: false,
    },
    time: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    currency: { type: DataTypes.ENUM(ProductCurrency.Euro), allowNull: false },
    value: { type: DataTypes.FLOAT(8, 2), allowNull: false },
  },
  {
    sequelize,
    tableName: 'products',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['period'],
      },
    ],
  },
);

export default Product;
