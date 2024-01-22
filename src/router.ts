import express, { Request, Response } from 'express';
const { Readable } = require('stream');
import { docs_v1 } from 'googleapis';
import { ConvertFileToDocx } from "./Service/googleService";

import multer from 'multer';
const upload = multer()


export const googleRouter = express.Router();
googleRouter.post('/', upload.single('file'), (async (req: Request, res: Response) => {
  const documentRequests: docs_v1.Schema$BatchUpdateDocumentRequest = JSON.parse(req.body.options).documentRequest as docs_v1.Schema$BatchUpdateDocumentRequest;
  if(!req.file) return res.status(400).json({
    status: 'Error',
    message: 'No file provided'
  });
  try {
    const item = await ConvertFileToDocx(req.file, documentRequests);
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
