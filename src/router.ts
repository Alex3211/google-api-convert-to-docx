import express, { Request, Response } from 'express';
import { ConvertHtmlToDocxService } from './Service/googleService'
const { Readable } = require('stream');
import fs from 'fs';

export const googleRouter = express.Router();
googleRouter.post('/', (async (req: Request, res: Response) => {
  const html = req.body.html;
  try {
    const item = await ConvertHtmlToDocxService(html);
    res.setHeader('Content-disposition', 'attachment; filename=' + 'document.docx');
    res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    // @ts-ignore
    res.setHeader('Content-Length', item.length)
    return res.end(item)
  }
  catch (err) {
    res.status(503).json({
      status: 'Error',
      message: err
    })
  }
}))
