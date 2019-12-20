//= ============================================================== =
// Arquivo que realiza a conexão com o banco de dados e
// carrega os models da aplicação
//= ============================================================== =

// Importando ORM's
import Sequelize from 'sequelize';
import mongoose from 'mongoose';

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
    this.mongo();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }

  mongo() {
    // URL de conexão do Mongo:
    // mongodb://Usuario+Senha/localhost:porta/nome_da_base_de_dados
    this.mongoConnection = mongoose.connect(
      'mongodb://localhost:27017/gobarber',
      {
        useNewUrlParser: true,
        useFindAndModify: true,
        useUnifiedTopology: true,
      }
    );
  }
}

export default new Database();
