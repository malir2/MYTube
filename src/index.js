import dotenv from "dotenv";
import database_Conection from "./db/database.js";
import app from "./app.js";
import upload from "./middlewares/multer.middleware.js";

dotenv.config({ path: "../.env" });

const port = process.env.PORT || 4000;

app.get("/", (req, res) => {
  res.json(upload);
});

database_Conection()
  .then(
    app.listen(port, () => {
      console.log(`App is listening on http://localhost:${port}`);
    })
  )
  .catch((err) => {
    console.log(`${err}: Fail to run the app.`);
  });
