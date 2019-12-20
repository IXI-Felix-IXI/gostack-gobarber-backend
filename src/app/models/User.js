import Sequelize, { Model } from 'sequelize';
import bcrypt from 'bcryptjs';

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        provider: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );

    //----------------------------------------------------------
    // Sequelize - HOOKS
    // -> Antes de salvar a criação ou edição de um usuário
    //----------------------------------------------------------
    this.addHook('beforeSave', async user => {
      // Caso tenha sido informado um novo password
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });

    return this;
  }

  //----------------------------------------------------------
  // Relacionamento com a tabela ´files´
  //----------------------------------------------------------
  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'avatar_id', as: 'avatar' });
  }

  // Retorna true se o parâmetro bate com a senha criptografada
  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

export default User;
