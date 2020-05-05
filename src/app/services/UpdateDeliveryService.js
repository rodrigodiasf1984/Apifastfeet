import { parseISO, getHours, isBefore } from 'date-fns';
import Deliveryman from '../models/Deliveryman';
import Recipient from '../models/Recipient';
import File from '../models/File';
import Delivery from '../models/Delivery';

class UpdateDeliveryService {
  async run({
    product,
    delivery_id,
    deliveryman_id,
    recipient_id,
    signature_id,
    start_date,
    end_date,
  }) {
    const delivery = await Delivery.findByPk(delivery_id);
    if (!delivery) throw new Error('Delivery does not exists');
    let deliveryman = {};
    if (deliveryman_id && deliveryman_id !== delivery.deliveryman_id) {
      deliveryman = await Deliveryman.findByPk(deliveryman_id);
      if (!deliveryman) {
        throw new Error('Deliveryman does not exists.');
      }
    }

    if (recipient_id && recipient_id !== delivery.recipient_id) {
      const recipient = await Recipient.findByPk(recipient_id);
      if (!recipient) {
        throw new Error('Recipient does not exists.');
      }
    }

    if (signature_id && signature_id !== delivery.signature_id) {
      const file = await File.findByPk(signature_id);
      if (!file) {
        throw new Error('File does not exists.');
      }
    }
    // verifica se as horas quando forem alteradas, se as mesma estão entre 08:00 e  18:00

    const parsedStartDate = parseISO(start_date);
    const parsedEndDate = parseISO(end_date);
    // verifica se o utilizador não está inserindo uma data de inicio ou fim da entrega antes da data atual
    if (
      isBefore(parsedStartDate, new Date()) ||
      isBefore(parsedEndDate, new Date())
    ) {
      throw new Error(
        "The start date or end date can not be before today's date"
      );
    }
    if (parsedStartDate) {
      const startHour = getHours(parsedStartDate);
      if (startHour <= 8 || startHour >= 18) {
        throw new Error('The start hour must be between 08:00 and 18:00');
      }
    }
    if (parsedEndDate) {
      const startHour = getHours(parsedStartDate);
      if (startHour <= 8 || startHour >= 18) {
        throw new Error('The start hour must be between 08:00 and 18:00');
      }
    }

    if (end_date && !start_date) {
      if (!delivery.start_date) {
        throw new Error('The delivery must have a start date!');
      }
    }

    if (start_date && end_date) {
      if (isBefore(parsedEndDate, parsedStartDate)) {
        throw new Error('The end date can not be before the start date!');
      }
    }

    const deliveryUpdated = await delivery.update(
      product,
      delivery_id,
      (deliveryman_id = deliveryman.id),
      recipient_id,
      signature_id,
      start_date,
      end_date
    );

    return deliveryUpdated;
  }
}

export default new UpdateDeliveryService();
