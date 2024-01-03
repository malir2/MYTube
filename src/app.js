import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(express.cookieParser());
app.use(express.cors());
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extends: true, limit: "20kb" }));

export default app;
