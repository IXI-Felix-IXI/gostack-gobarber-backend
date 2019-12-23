import * as Yup from 'yup';
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import User from '../models/User';
import File from '../models/File';
import Appointment from '../models/Appointment';
import Notification from '../schemas/Notification';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      limit: 20,
      offset: (page - 1) * 20,
      attributes: ['id', 'date'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { provider_id, date } = req.body;

    /**
     * Verificando se o `provider_id` é realmente de um provider
     */
    const checkIsprovider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!checkIsprovider) {
      return res
        .status(401)
        .json({ error: 'You can only create appointments with providers' });
    }

    /**
     * Verificação para que o usuário não possa marcar um agendamento para ele mesmo
     */
    if (provider_id === req.userId) {
      return res
        .status(401)
        .json({ error: 'Users cannot create appointments for themselves' });
    }

    /**
     * Verificando se a data informada é inferior a data atual
     */
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    /**
     * Verificando disponibilidade do agendamento
     */
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      },
    });

    if (checkAvailability) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not available' });
    }

    const apppointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date: hourStart,
    });

    /**
     * Criando notificação para o prestador de serviço utilizando o mongo
     */

    const user = await User.findByPk(req.userId);

    // Formatando a data que será exibida na notificação
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      {
        locale: pt,
      }
    );

    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id,
    });

    return res.json(apppointment);
  }

  async delete(req, res) {
    const appointment = await Appointment.findByPk(req.params.id);

    // Verificando se o usuário esta tentando deletar um agentamento que não é dele
    if (appointment.user_id !== req.userId) {
      return res.status(401).json({
        error: "You don't have permission to cancel this appointment",
      });
    }

    // Quando os campos datas são retornados direto do banco, não precisamos
    // nos preocupar de utilizar a função `parseISO` pois eles já vem no formato
    // de data correto

    // Verificando se o usuário esta cancelando com pelo menos duas horas de antecedência
    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: 'You can only cancel appointments 2 hours in advance',
      });
    }

    appointment.canceled_at = new Date();

    await appointment.save();

    return res.json(appointment);
  }
}

export default new AppointmentController();
