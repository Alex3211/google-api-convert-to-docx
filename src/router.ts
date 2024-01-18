import express, { Request, Response } from 'express';
import { ConvertHtmlToDocxService } from './Service/googleService'

export const googleRouter = express.Router();

googleRouter.post('/', (async (req: Request, res: Response) => {
  const html = req.body.html;
  try {
    const item = await ConvertHtmlToDocxService(html);
    res.status(200).json({
      status: 'Successful',
      // @ts-ignore
      data: new Buffer.from(item, 'binary')
    })
  }
  catch (err) {
    res.status(503).json({
      status: 'Error',
      message: err
    })
  }
}))
