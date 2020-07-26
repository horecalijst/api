import { DataTypes, Model } from 'sequelize';
import sequelize from 'services/sequelize';

export enum ProductCurrency {
  Euro = 'EUR',
}

class Product extends Model {
  public id!: string;
  public description!: string;
  public currency!: ProductCurrency;
  public value!: number;
  public time!: number;
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
    currency: { type: DataTypes.ENUM(ProductCurrency.Euro), allowNull: false },
    value: { type: DataTypes.FLOAT(8, 2), allowNull: false },
    time: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  },
  {
    sequelize,
    tableName: 'products',
    timestamps: true,
    paranoid: true,
  },
);

export default Product;
