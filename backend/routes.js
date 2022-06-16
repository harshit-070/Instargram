const post = require("./routes/postRoute");
const user = require("./routes/userRoute");
const chat = require("./routes/chatRoute");
const message = require("./routes/messageRoute");
const errorMiddleware = require("./middlewares/error");

const routes = (app) => {
  app.get("/", (req, res) => {
    res.json({ status: true });
  });
  app.use("/api/v1", post);
  app.use("/api/v1", user);
  app.use("/api/v1", chat);
  app.use("/api/v1", message);

  app.use(errorMiddleware);
};

module.exports = routes;
