import express, { Request, Response } from 'express';
const { Readable } = require('stream');
import fs from 'fs';
import { docs_v1 } from 'googleapis';
import { ConvertHtmlToDocx } from "./Service/googleService";

export const googleRouter = express.Router();
googleRouter.post('/', (async (req: Request, res: Response) => {
  
  const html: string = req.body.html;
  const documentRequests: docs_v1.Schema$BatchUpdateDocumentRequest = req.body.documentRequest as docs_v1.Schema$BatchUpdateDocumentRequest;

  try {
    const item = await ConvertHtmlToDocx(html, documentRequests);
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
