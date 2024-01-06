import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cookieParser());
app.use(cors());
app.use(express.json({ limit: "20kb" }));
app.use(urlencoded({ extended: "true", limit: "20kb" }));

// Import router
import router from "./routes/user.routes.js";

// We use '.use' here to use router as a middleware
app.use("/api/v1/user", router);

export default app;
