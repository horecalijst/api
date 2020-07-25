import { DataTypes, Model } from 'sequelize';
import sequelize from 'services/sequelize';

import User from './user';

class Business extends Model {
  public id!: string;
  public userId!: string;
  public name!: string;
  public address!: string;
  public country!: string;
  public vat!: string;
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

Business.belongsTo(User, { as: 'user', constraints: false });

export default Business;
