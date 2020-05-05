import { Op } from 'sequelize';
import File from '../models/File';
import Delivery from '../models/Delivery';
import Recipient from '../models/Recipient';
import Deliveryman from '../models/Deliveryman';
import RegistrationMail from '../jobs/RegistrationMail';
import Queue from '../../lib/Queue';
import UpdateDeliveryService from '../services/UpdateDeliveryService';

class DeliveryController {
  async store(req, res) {
    const { product, recipient_id, deliveryman_id } = req.body;
    const deliveryman = await Deliveryman.findByPk(deliveryman_id);

    if (!deliveryman)
      return res.status(400).json({ error: 'Deliveryman not found' });

    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient)
      return res.status(400).json({ error: 'Recipient not found' });

    // const checkDeliveryExists = await Delivery.findOne({
    //   where: {
    //     recipient_id,
    //     deliveryman_id,
    //   },
    // });

    // if (checkDeliveryExists)
    //   return res.status(400).json({ error: 'Delivery already exists' });

    const delivery = await Delivery.create(req.body);
    await Queue.add(RegistrationMail.key, {
      delivery,
      recipient,
      deliveryman,
    });
    const { id } = delivery;
    return res.json({
      delivery: {
        id,
        product,
        recipient_id,
        deliveryman_id,
      },
    });
  }

  async delete(req, res) {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) {
      return res.status(400).json({ error: 'Delivery does not exists.' });
    }
    try {
      await delivery.destroy();
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
    return res.status(200).json({ message: 'Delivery deleted!' });
  }

  async update(req, res) {
    const { id } = req.params;
    const delivery = await Delivery.findByPk(id);

    if (!delivery)
      return res.status(400).json({ error: 'Delivery does not exists' });

    const {
      deliveryman_id,
      recipient_id,
      signature_id,
      start_date,
      end_date,
    } = req.body;

    const deliveryUpdated = await UpdateDeliveryService({
      deliveryman_id,
      recipient_id,
      signature_id,
      start_date,
      end_date,
    });
    return res.json({ deliveryUpdated });
  }

  async index(req, res) {
    const { page = 1, q } = req.query; // caso não seja informado o número da página, por padrão será a página 1

    if (q !== '') {
      // buscar o deliveryman de acordo com o nome
      const deliveryByName = await Delivery.findAll({
        where: {
          product: {
            [Op.iLike]: `${q}%`,
          },
        },
        order: ['created_at'],
        attributes: ['id', 'product', 'start_date', 'end_date', 'canceled_at'],
        limit: 9, // lista somente 20 resultados
        offset: (page - 1) * 9, // serve para determina quantos registos eu quero pular
        include: [
          // include faz o relacionamento entre o entrega e o entregador
          {
            model: Deliveryman,
            as: 'deliveryman',
            attributes: ['id', 'name'], // retorna somente os campos dentro do array attributes
            include: [
              {
                model: File,
                as: 'avatar', // as: avatar
                attributes: ['id', 'path', 'url'],
              },
            ],
          },
          {
            model: File,
            as: 'signature',
            attributes: ['name', 'path', 'url'],
          },
          {
            model: Recipient,
            as: 'recipient',
            attributes: [
              'id',
              'name',
              'street',
              'street_number',
              'complement',
              'uf',
              'city',
              'postal_code',
            ],
          },
        ],
      });

      if (deliveryByName.length === 0) {
        return res.status(400).json('Delivery does not exists');
      }
      return res.json(deliveryByName);
    }

    const listDeliveries = await Delivery.findAll({
      order: ['created_at'],
      attributes: ['id', 'product', 'start_date', 'end_date', 'canceled_at'],
      limit: 9, // lista somente 9 resultados
      offset: (page - 1) * 9, // serve para determina quantos registos eu quero pular
      include: [
        // include faz o relacionamento entre o entrega e o entregador
        {
          model: Deliveryman,
          as: 'deliveryman',
          attributes: ['id', 'name'], // retorna somente os campos dentro do array attributes
          include: [
            {
              model: File,
              as: 'avatar', // as: avatar
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['name', 'path', 'url'],
        },
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'street_number',
            'complement',
            'uf',
            'city',
            'postal_code',
          ],
        },
      ],
    });
    return res.json(listDeliveries);
  }
}
export default new DeliveryController();
