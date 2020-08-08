import { Sequelize as _Sequalize } from 'sequelize';

const Sequelize = new _Sequalize({
  dialect: 'mariadb',
  dialectOptions: {
    timezone: 'UTC',
  },
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASS,
  define: {
    charset: 'utf8mb4',
  },
  logging: process.env.NODE_ENV !== 'production',
});

export default Sequelize;
