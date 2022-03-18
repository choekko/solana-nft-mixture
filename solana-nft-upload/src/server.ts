import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';

const app =express();
import {routesFunc} from './routes.js';
app.use(express.json());
app.use(cors());

const _id = process.env.KEYPAIR;
routesFunc(app,_id);
app.listen(process.env.PORT || 8082, () => {
console.log('listening on port 8082');
})
