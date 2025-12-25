const express = require("express");
const app = express();
const cors = require("cors");
const session = require("express-session");
const path = require("path");
app.set("trust proxy", 1); 
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

app.use(
  session({
    name: "photo-sharing-session",
    secret: "photo-sharing-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,       
      sameSite: "lax",    
      maxAge: 24 * 60 * 60 * 1000,
    },
  })
);


app.use("/images", express.static(path.join(__dirname, "images")));

app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
app.use("/api/comment", CommentRouter);
app.use("/admin", AdminRouter);
app.use("/user", AdminRouter);


app.get("/", (req, res) => {
  res.json({ message: "Hello from photo-sharing app API!" });
});


const PORT = 8081;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
