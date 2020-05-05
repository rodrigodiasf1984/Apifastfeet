import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      product: Yup.string(),
      recipient_id: Yup.number().positive(),
      deliveryman_id: Yup.number().positive(),
      signature_id: Yup.number().positive(),
    });
    const schemaParamd = Yup.object(req.params).shape({
      id: Yup.number()
        .positive()
        .required(),
    });
    await schema.validate(req.body, { abortEarly: false });
    await schemaParamd.validate(req.params, { abortEarly: false });
    return next();
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Validation fails', messages: err.inner });
  }
};
