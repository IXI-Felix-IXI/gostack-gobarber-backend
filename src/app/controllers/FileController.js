import File from '../models/File';

class FileController {
  async store(req, res) {
    // Quando é utilizado a biblioteca Multer, dentro do req é criado
    // a variável ´file´ que contem informações da imagem enviada
    const { originalname: name, filename: path } = req.file;

    const file = await File.create({
      name,
      path,
    });

    return res.json(file);
  }
}

export default new FileController();
