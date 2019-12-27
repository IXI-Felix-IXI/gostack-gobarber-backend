require('dotenv/config');

module.exports = {
  dialect: 'postgres',
  hostname: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  define: {
    // Adiciona  a coluna 'created_at' e 'updated_at' de cada registro
    timestamps: true,

    // Informa o sequelize que será utilizado a padronização de tabelas e colunas
    // por meio do padrão underscore (user_groups)
    underscored: true,
    underscoredAll: true,
  },
};
