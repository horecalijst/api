import { DataTypes, Model } from 'sequelize';
import sequelize from 'services/sequelize';

class Contact extends Model {
  public id!: string;
  public businessId!: string;
  public name?: string | null;
  public email?: string | null;
  public phone?: string | null;
  public destroyedAt!: Date;
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
    email: { type: DataTypes.STRING(64), allowNull: true },
    phone: { type: DataTypes.STRING(32), allowNull: true },
    destroyedAt: { type: DataTypes.DATE, allowNull: true },
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
      {
        fields: ['createdAt'],
      },
      {
        fields: ['destroyedAt'],
      },
    ],
  },
);

export default Contact;
