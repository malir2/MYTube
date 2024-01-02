import dotenv from "dotenv";
import database_Conection from "./db/database.js";

dotenv.config({ path: "./env" });

database_Conection();
