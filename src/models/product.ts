import { DataTypes, Model } from 'sequelize';
import sequelize from 'services/sequelize';

export enum ProductCurrency {
  Euro = 'EUR',
}

class Product extends Model {
  public id!: string;
  public name!: string;
  public currency!: ProductCurrency;
  public price!: number;
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
    name: { type: DataTypes.STRING(16), allowNull: false },
    currency: { type: DataTypes.ENUM(ProductCurrency.Euro), allowNull: false },
    price: { type: DataTypes.FLOAT(8, 2), allowNull: false },
  },
  {
    sequelize,
    tableName: 'products',
    timestamps: true,
    paranoid: true,
  },
);

export default Product;
