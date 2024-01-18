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
app.use(express.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.route("/").get((req: Request, res: Response) => {
  fs.readFile('./index.html', 'utf8', (err, text) => {
    // pour le cross origin
    res.set("Content-Security-Policy", "default-src *; style-src 'self' http://* 'unsafe-inline'; script-src 'self' http://* 'unsafe-inline' 'unsafe-eval'")
      .send(text);
  });
})
app.use(`/`, googleRouter);
app.listen(port, () => {
  console.log(`Server is running at ${host}:${port} !`);
})