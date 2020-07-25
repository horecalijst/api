import { startOfToday } from 'date-fns';
import { DataTypes, Model } from 'sequelize';
import { Op } from 'sequelize';
import sequelize from 'services/sequelize';

import Contact from './contact';

class Business extends Model {
  public id!: string;
  public userId!: string;
  public name!: string;
  public address!: string;
  public country!: string;
  public vat!: string;
  public readonly numberOfContactsTotal!: number;
  public readonly numberOfContactsToday!: number;
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

Business.hasMany(Contact, { as: 'contacts', constraints: false });

export default Business;
