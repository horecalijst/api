import { DataTypes, Model } from 'sequelize';
import sequelize from 'services/sequelize';

import Business from './business';

class Contact extends Model {
  public id!: string;
  public businessId!: string;
  public name?: string | null;
  public email?: string | null;
  public phone?: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
  public readonly deletedAt?: Date | null;
}

Contact.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    businessId: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
    },
    name: { type: DataTypes.STRING(64), allowNull: true },
    email: { type: DataTypes.STRING(64), allowNull: false },
    phone: { type: DataTypes.STRING(16), allowNull: false },
  },
  {
    sequelize,
    tableName: 'contacts',
    timestamps: true,
    paranoid: true,
    indexes: [
      {
        fields: ['businessId'],
      },
    ],
  },
);

Contact.belongsTo(Business, { as: 'contact', constraints: false });

export default Contact;
