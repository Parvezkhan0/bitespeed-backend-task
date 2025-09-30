import { Router } from 'express';
import { identifyContact } from '../services/contactService';

const router = Router();

export const postContact = router.post('/', async (req, res) => {
  const { email, phoneNumber } = req.body;
  const result = await identifyContact(email, phoneNumber);
  res.status(200).json(result);
});

export const getContact = router.get('/', () => {
  console.log("Get response")
})

export default router;
