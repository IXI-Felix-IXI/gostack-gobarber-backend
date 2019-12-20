module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'docker',
  database: 'gobarber',
  define: {
    // Adiciona  a coluna 'created_at' e 'updated_at' de cada registro
    timestamps: true,

    // Informa o sequelize que será utilizado a padronização de tabelas e colunas
    // por meio do padrão underscore (user_groups)
    underscored: true,
    underscoredAll: true,
  },
};
