//= ============================================================== =
// Arquivo que realiza a conexão com o banco de dados e
// carrega os models da aplicação
//= ============================================================== =

// Importando sequelize
import Sequelize from 'sequelize';

// Importando models
import User from '../app/models/User';
import File from '../app/models/File';
import Appointment from '../app/models/Appointment';

// Importando configurações do banco
import databaseConfig from '../config/database';

const models = [User, File, Appointment];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
