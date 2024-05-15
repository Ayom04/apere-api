require("dotenv").config();
const express = require("express");
const app = express();
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const cors = require("cors");
const compression = require("compression");
const PORT = process.env.PORT || 3000;

const { notFoundMessage, welcomeMessage } = require("./src/constants/messages");
const logger = require("./src/config/logger");
const userRoute = require("./src/router/user");
const authRoute = require("./src/router/auth");
app.use(mongoSanitize());
app.use(helmet());
app.use(compression());

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/user", userRoute);
app.use("/api/v1/auth", authRoute);

app.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    message: welcomeMessage
  });
});

app.listen(PORT, () => {
  logger.info({ message: `...app listening on porthttp://localhost:${PORT}` });
  console.log(`Server running on port http://localhost:${PORT}`);
});

app.use((req, res) => {
  res.status(404).json({
    status: false,
    message: notFoundMessage,
  });
});
