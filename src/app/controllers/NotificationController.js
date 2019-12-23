import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    /**
     * Verificando se o `provider_id` é realmente de um provider
     */
    const checkIsprovider = await User.findOne({
      where: { id: req.userId, provider: true },
    });

    if (!checkIsprovider) {
      return res
        .status(401)
        .json({ error: 'Only providers can load notifications' });
    }

    // Importate: Os métodos disponibilizados pelo schema do Mongo DB
    // são um pouco diferentes dos utilizados pelo Sequelize. Abaixo o
    // método para retorno de todos os elementos de uma pesquisa é o `find`,
    // com a função `sort`logo após e o `limit` para definirmos apenas 20 registros
    const notifications = await Notification.find({
      user: req.userId,
    })
      .sort({ createdAt: 'desc' })
      .limit(20);

    return res.json(notifications);
  }
}

export default new NotificationController();
