import { Op } from 'sequelize';
import Deliveryman from '../models/Deliveryman';
import File from '../models/File';
import Cache from '../../lib/Cache';

class DeliverymanController {
  async index(req, res) {
    // paginação, mostra 9 resultados por página
    const { page = 1, q } = req.query; // caso não seja informado o número da página, por padrão será a página 1
    // buscar dentro cached a lista de entregadores caso exista.
    const cached = await Cache.get('deliverymans');

    if (cached) {
      return res.json(cached);
    }

    if (q) {
      // buscar o deliveryman de acordo com o nome
      const deliverymanbyName = await Deliveryman.findAll({
        where: {
          name: {
            [Op.iLike]: `${q}%`,
          },
        },
        attributes: ['id', 'name', 'email'],
        limit: 9, // lista somente 9 resultados
        offset: (page - 1) * 9, // serve para determina quantos registos eu quero pular
        include: [
          {
            model: File,
            as: 'avatar',
            attributes: ['id', 'path', 'url'],
          },
        ],
      });

      if (deliverymanbyName.length === 0) {
        return res.status(400).json({ error: 'User does not exist' });
      }
      return res.json(deliverymanbyName);
    }
    // retorna a lista de agendamento do utlizador que fez a requisição

    const listDeliverymans = await Deliveryman.findAll({
      attributes: ['id', 'name', 'email'],
      limit: 9, // lista somente 9 resultados
      offset: (page - 1) * 9, // serve para determina quantos registos eu quero pular
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });
    // guarda o resultado da query dentro do cache
    await Cache.set('deliverymans', listDeliverymans);
    return res.json(listDeliverymans);
  }

  async store(req, res) {
    const deliverymanExist = await Deliveryman.findOne({
      where: { email: req.body.email },
    });

    if (deliverymanExist) {
      return res.status(400).json({ error: 'User already exist!' });
    }
    const { id, name, email, avatar_id } = await Deliveryman.create(req.body);
    await Cache.invalidate('deliverymans');
    return res.json({
      id,
      name,
      email,
      avatar_id,
    });
  }

  async update(req, res) {
    const { id } = req.params;
    const { email, avatar_id } = req.body;

    const deliveryman = await Deliveryman.findByPk(id);
    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists.' });
    }
    if (email && email !== deliveryman.email) {
      const checkDeliverymanExists = await Deliveryman.findOne({
        where: { email },
      });

      if (checkDeliverymanExists) {
        return res.status(400).json({ error: 'Deliveryman already exists' });
      }
    }
    if (avatar_id && avatar_id !== deliveryman.avatar_id) {
      const checkIfAvatarExists = await File.findByPk(avatar_id);

      if (!checkIfAvatarExists) {
        return res
          .status(400)
          .json({ error: 'The avatar file does not exists' });
      }
    }

    const { name } = await deliveryman.update(req.body);
    await Cache.invalidate('deliverymans');
    return res.json({
      id,
      name,
      email,
      avatar_id,
    });
  }

  async delete(req, res) {
    const deliveryman = await Deliveryman.findByPk(req.params.id);
    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman does not exists.' });
    }
    try {
      await deliveryman.destroy();
      await Cache.invalidate('deliverymans');
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }

    return res.status(200).json({ message: 'Deliveryman deleted!' });
  }

  async show(req, res) {
    const { id } = req.params;

    const deliveryman = await Deliveryman.findByPk(id, {
      attributes: {
        exclude: ['avatar_id'],
      },
      include: [
        {
          model: File,
          as: 'avatar',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    if (!deliveryman) {
      return res.status(400).json({ error: 'Deliveryman not found' });
    }

    return res.json(deliveryman);
  }
}
export default new DeliverymanController();
