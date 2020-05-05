import { Op } from 'sequelize';
import Recipient from '../models/Recipient';

class RecipientController {
  async index(req, res) {
    // paginação, mostra 9 resultados por página
    const { page = 1, q } = req.query; // caso não seja informado o número da página, por padrão será a página 1

    if (q) {
      // buscar o recipient de acordo com o nome
      const recipientByName = await Recipient.findAll({
        where: {
          name: {
            [Op.iLike]: `${q}%`,
          },
        },
        order: ['created_at'],
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
        limit: 9, // lista somente 9 resultados
        offset: (page - 1) * 9, // serve para determina quantos registos eu quero pular
      });

      if (recipientByName.length > 0) {
        return res.json(recipientByName);
      }

      return res.status(400).json('Recipient does not exists');
    }
    // retorna a lista de agendamento do utlizador que fez a requisição
    const listRecipients = await Recipient.findAll({
      order: ['created_at'],
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
      limit: 9, // lista somente 9 resultados
      offset: (page - 1) * 9, // serve para determina quantos registos eu quero pular
    });
    return res.json(listRecipients);
  }

  async store(req, res) {
    const recipientExists = await Recipient.findOne({
      where: { name: req.body.name },
    });
    if (recipientExists) {
      return res.status(400).json({ error: 'Recipient already exists.' });
    }
    if (!req.body.complement) {
      delete req.body.complement;
    }
    const recipient = await Recipient.create(req.body);
    const {
      id,
      name,
      street,
      street_number,
      complement,
      uf,
      city,
      postal_code,
    } = recipient;
    return res.json({
      id,
      name,
      street,
      street_number,
      complement,
      uf,
      city,
      postal_code,
    });
  }

  async update(req, res) {
    if (!req.params.id) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { id } = req.params;
    const { name } = req.body;
    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exists.' });
    }
    if (name !== recipient.name) {
      const recipientExists = await Recipient.findOne({ where: { name } });
      if (recipientExists) {
        return res.status(400).json({ error: 'Recipient already exists.' });
      }
    }

    const {
      street,
      street_number,
      complement,
      uf,
      city,
      postal_code,
    } = await recipient.update(req.body);

    return res.json({
      id,
      name,
      street,
      street_number,
      complement,
      uf,
      city,
      postal_code,
    });
  }

  async delete(req, res) {
    const recipient = await Recipient.findByPk(req.params.id);
    if (!recipient) {
      return res.status(400).json({ error: 'Recipient does not exists.' });
    }
    try {
      await recipient.destroy();
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }

    return res.status(200).json({ message: 'Recipient deleted!' });
  }
}
export default new RecipientController();
