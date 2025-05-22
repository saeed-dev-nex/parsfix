import { z } from 'zod';
export const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      console.log('Validation Errors : ', errors);
      return res
        .status(400)
        .json({ message: 'داده های ورودی نامعتبر', errors });
    }
    next();
  } catch (error) {
    console.error('unexpected Error : ', error);
  }
};
