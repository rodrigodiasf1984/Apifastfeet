import * as Yup from 'yup';

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      name: Yup.string(),
      street: Yup.string().when('postal_code', (postal_code, field) =>
        postal_code ? field.required() : field
      ),
      // verifica se a rua estiver preenchida se sim, torna o campo street_number obrigatório
      street_number: Yup.string().when('street', (street, field) =>
        street ? field.required() : field
      ),
      complement: Yup.string(),
      uf: Yup.string()
        .max(2) // verifica se a cidade estiver preenchida se sim, torna o campo uf obrigatório
        .when('city', (city, field) => (city ? field.required() : field)),
      // verifica se o cep estiver preenchido se sim, torna o campo city obrigatório
      city: Yup.string().when('postal_code', (postal_code, field) =>
        postal_code ? field.required() : field
      ),
      // verifica se a rua estiver preenchido se sim, torna o campo postal_code obrigatório
      postal_code: Yup.string(),
    });
    const schemaParamd = Yup.object(req.params).shape({
      id: Yup.number().required(),
    });
    // verifica se o corpo da requisição foi devidamente preenchido ou se o parâmetro é um número
    await schema.validate(req.body, { abortEarly: false });
    await schemaParamd.validate(req.params, { abortEarly: false });
    return next();
  } catch (err) {
    return res.status(400).json({ error: 'Validation fails' });
  }
};
