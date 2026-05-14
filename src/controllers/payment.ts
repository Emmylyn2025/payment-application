import { NextFunction, Request, Response } from 'express';
import { appError, asyncHandler } from '../utils/error';
import axios from 'axios';

export const processPayment = asyncHandler(async (req: Request<{}, { amount: number; email: string }>, res: Response, next: NextFunction) => { 
    const { amount, email } = req.body;
  
    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email,
      amount: amount * 100, // Paystack expects amount in kobo
    }, {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_PUBLIC_KEY}`
      }
    });

    res.json(response.data);
})