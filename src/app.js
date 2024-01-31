import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(cookieParser());
app.use(express.static("../public"));
app.use(cors());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: "true", limit: "200mb" }));

// Import router
import router from "./routes/user.routes.js";

// We use '.use' here to use router as a middleware
app.use("/api/v1/user", router);

export default app;
