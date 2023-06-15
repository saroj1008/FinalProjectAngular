import { Router } from 'express'
import { signin, signup, getAllUsers, getUserById } from './users.controller.js';
const router = Router();


router.post('/signin', signin);
router.post('/signup', signup);
router.get('/',getAllUsers);
router.get('/:user_id',getUserById);

export default router;