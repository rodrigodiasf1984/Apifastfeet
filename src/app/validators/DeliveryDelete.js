import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schemaParam = Yup.object(req.params).shape({
      id: Yup.number()
        .positive()
        .required(),
    });

    await schemaParam.validate(req.params, { abortEarly: false });
    return next();
  } catch (err) {
    return res
      .status(400)
      .json({ error: 'Validation fails', messages: err.inner });
  }
};
