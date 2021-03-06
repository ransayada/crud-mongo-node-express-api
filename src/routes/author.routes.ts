import express from 'express';
import controller from '../controllers/author.controller';
import { Schemas, validateSchema } from '../middleware/validateSchema';

const router = express.Router();

router.post('/create',validateSchema(Schemas.author.create), controller.createAuthor);
router.get('/get/:authorId', controller.readAuthor);
router.get('/get', controller.readAll);
router.patch('/update/:authorId', validateSchema(Schemas.author.update), controller.updateAuthor);
router.delete('/delete/:authorId', controller.deleteAuthor);

export = router;
