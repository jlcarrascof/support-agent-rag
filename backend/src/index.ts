import "dotenv/config";
import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health.js";
import { searchRouter } from "./routes/search.js";

const app = express();
const port = process.env.PORT ?? 3000;

app.use(cors());
app.use(express.json());
app.use(healthRouter);
app.use(searchRouter);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export { app };
