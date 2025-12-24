const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const path = require("path"); 

const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const CommentRouter = require("./routes/CommentRouter");
const AdminRouter = require("./routes/AdminRouter");

dbConnect();
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

app.use(session({
  name: "photo-sharing-session",
  secret: "photo-sharing-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
app.use("/api/comment", CommentRouter);
app.use("/admin", AdminRouter);
app.use("/user", AdminRouter);

app.get("/", (req, res) => {
  res.send({ message: "Hello from photo-sharing app API!" });
});

app.listen(8081, () => {
  console.log("server listening on port 8081");
});
