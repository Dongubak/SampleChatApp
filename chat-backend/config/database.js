const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,    // DB 이름
  process.env.DB_USER,    // 사용자명
  process.env.DB_PASSWORD, // 비밀번호
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT, // mysql
    port: process.env.DB_PORT,
    logging: false,  // SQL 쿼리 로그 비활성화
  }
);

// 데이터베이스 연결 확인
(async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL 연결 성공!');
  } catch (error) {
    console.error('DB 연결 실패:', error);
  }
})();

module.exports = sequelize;