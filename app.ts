import express from "express";
const app = express();
import "dotenv/config";

app.get("/", (req, res) => {
  res.send("Hello World");
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Listening on Port ${PORT}`);
});
