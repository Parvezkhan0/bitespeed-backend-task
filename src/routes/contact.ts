import { Router, Request, Response } from 'express';
import { identifyContact } from '../services/contactService';

const router = Router();

// POST /identify
export const postContact = router.post('/', async (req: Request, res: Response) => {
  const { email, phoneNumber } = req.body;
  const result = await identifyContact(email, phoneNumber);
  res.status(200).json(result);
});

// GET /identify
export const getContact = router.get('/', (_req: Request, res: Response) => {
  res.status(200).send("Get response");
});

export default router;
