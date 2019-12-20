import jwt from 'jsonwebtoken';

import authConfig from '../../config/auth';

import User from '../models/User';

class SessionController {
  async store(req, res) {
    // Recebendo o email e senha do body
    const { email, password } = req.body;

    // Verificando se existe um usuário com este email cadastrado
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Verificando se o password inserido bate com o cadastrado
    // bcrypt.compare é assíncrono, por isso é necessário o await
    if (!(await user.checkPassword(password))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name } = user;

    return res.json({
      user: {
        id,
        name,
        email,
      },

      /**
       * => 1°) Parâmetro: Payload
       * => 2°) Parâmetro: Private Key (Site MD5 online para pegar um hash)
       * => 3°) Parâmetro: Configuração de data de expiração
       */
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
