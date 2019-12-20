import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

//----------------------------------
// Middleware de autenticação
//----------------------------------
export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  // Desestruturação ignorando o primeiro retorno que seria o 'bearer' e pegando
  // apenas o token
  const [, token] = authHeader.split(' ');

  try {
    // Biblioteca promisify é utilizada para transformarar a função
    // verify (que utiliza function callback) em uma função async await
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    // Constante 'decoded' vai conter o ID (Payload repassado no SessionController),
    // 'iat' formato Unix Time Stamp do horário que o token passou a ser válido
    // 'exp' formato Unix Time Stamp do horário que o token expira (definido daqui a 7 dias)

    // Inserindo o ID do usuário dentro do req
    req.userId = decoded.id;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};
