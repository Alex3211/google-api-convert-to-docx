import express ,{Response,Request} from 'express';
import * as dotenv from 'dotenv';
dotenv.config();

import helmet from 'helmet';
import cors from 'cors';
import bodyParser from 'body-parser';

import {googleRouter} from './router'

const app = express();
const port:number = parseInt(process.env.PORT as string,10);
const host:string = String(process.env.HOST_DEV);

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.route("/").get((req:Request,res:Response)=>{
    res.json("Test received!")
})
app.use(`/`, googleRouter);
app.listen(port,()=>{
    console.log(`Server is running at ${host}:${port} !`);
})