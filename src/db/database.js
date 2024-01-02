import mongoose from "mongoose";
import { Database_Name } from "../constant.js";

const database_Conection = async () => {
  try {
    const database_Connection_Process = await mongoose.connect(
      `${process.env.DATABASE_URL}/${Database_Name}`
    );
    // I used .connection.host to just remain connect with my database
    console.log(
      `Database is connected successfull: ${database_Connection_Process.connection.host}`
    );
  } catch (error) {
    console.log(`${error}: Fail to connect to the database!`);
  }
};

export default database_Conection;
