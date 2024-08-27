require('module-alias/register')
import express, { Application } from "express";
import routes from "@/src/routes";
require("dotenv").config();
const app: Application = express();
const port = process.env.PORT || 5002;
import cors from 'cors';
app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.listen(port, () => console.log(`server listening on port ${port}`));
