import express, { Response, Request } from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';

import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';

import { googleRouter } from './router'

const app = express();
const port: number = parseInt(process.env.PORT as string, 10);
const host: string = String(process.env.HOST_DEV);

app.use(helmet());
app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

app.route("/").get((req: Request, res: Response) => {
  fs.readFile('./index.html', 'utf8', (err, text) => {
    // pour le cross origin
    res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
      .send(text);
  });
})
app.use(`/`, googleRouter);

// buggé ??
const logger = (req: { method: any; url: any; ip: any; }, res: any, next: () => void) => { 
  console.log(`
      ${req.method} 
      ${req.url} 
      ${req.ip}`); 
      next(); 
  };  

app.use(logger);

app.listen(port, () => {
  console.log(`Server is running at ${host}:${port} !`);
})