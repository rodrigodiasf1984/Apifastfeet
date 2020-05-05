import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schemaParamd = Yup.object(req.params).shape({
      delivery_id: Yup.number()
        .positive()
        .required(),
    });
    await schemaParamd.validate(req.params, { abortEarly: false });
    return next();
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Validation fails', messages: err.inner });
  }
};
