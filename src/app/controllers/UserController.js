import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  //--------------------------------------
  //  STORE
  //--------------------------------------
  async store(req, res) {
    // Schema validation (YUP) do 'req.body'
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
    });

    // Verificando se o 'req.body' esta sendo passado conforme o schema
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    // Verificando se já existe um usuário com o email informado cadastrado
    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).json({ error: 'User already exists.' });
    }

    const { id, name, email, provider } = await User.create(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }

  //--------------------------------------
  //  UPDATE
  //--------------------------------------
  async update(req, res) {
    // Schema validation (YUP) do 'req.body'
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
      avatar_id: Yup.number(),
    });

    // Verificando se o 'req.body' esta sendo passado conforme o schema
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails.' });
    }

    const { email, oldPassword } = req.body;

    const user = await User.findByPk(req.userId);

    // Verificação se o usuário esta alterando o email, caso esteja, será
    // necessário verificar se o novo email inserido já não existe na base de dados
    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } });

      if (userExists) {
        return res.status(400).json({ error: 'User already exists.' });
      }
    }

    // Verificando se o usuário esta alterando o password, caso esteja, será
    // necessário verificar se o password inserido bate com o cadastrado na base de dados
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    const { id, name, provider } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
      provider,
    });
  }
}

export default new UserController();
