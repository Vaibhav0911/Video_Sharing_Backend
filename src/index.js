import dotenv from "dotenv";
import { app } from "./app.js";
import { connectDB } from "./db/connectdb.js";

dotenv.config();

connectDB()
  .then(() => {
    console.log("Connected to MONGODB");
    const server = app.listen(process.env.PORT, () => {
      console.log(`server is listening at port ${process.env.PORT}`);
    });
    server.on("error", (err) => {
      console.log(`Server Failed ${err}`);
    });
  })
  .catch((err) => {
    console.log("Failed DB connection");
    process.exit(1);
  });
