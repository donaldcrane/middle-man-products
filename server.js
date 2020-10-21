const express = require("express");
const logger = require("morgan");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const passport = require("passport");
const cookieSession = require("cookie-session");
require("./passport/google-passport")(passport)

dotenv.config();

const app = express();

mongoose.connect(
  process.env.DATABASE,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  (err) => {
    if (err) {
      console.log("my err", err);
    } else {
      console.log("Connected to the database");
    }
  }
);

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieSession({
  maxAge: 24 * 60 * 60 * 1000,
  keys: process.env.COOKIE_KEY

}));
app.use(passport.initialize());
app.use(passport.session());

// passport.use(googleStrategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
    console.log("user deserial", user);
    done(null, user);
  });
});

const productRoutes = require("./routes/product");
const categoryRoutes = require("./routes/category");
const ownerRoutes = require("./routes/owner");
const userRoutes = require("./routes/auth");
const reviewRoutes = require("./routes/review");
const addressRoutes = require("./routes/address");
const cartRoutes = require("./routes/cart");
const paymentRoutes = require("./routes/payment")
const historyRoutes = require("./routes/history")

app.use("/api", productRoutes);
app.use("/api", categoryRoutes);
app.use("/api", ownerRoutes);
app.use("/api", userRoutes);
app.use("/api", reviewRoutes);
app.use("/api", addressRoutes);
app.use("/api", cartRoutes);
app.use("/api", paymentRoutes);
app.use("/api", historyRoutes);

app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"]
}));

app.get("/auth/google/callback",passport.authenticate("google", {
  scope: ["profile", "email"]
}),(req,res)=>{
  res.send(req.user);
  res.send("you reached the redirect URI");
});

app.get("/auth/logout", (req, res) => {
  req.logout();
  res.send(req.user);
});

app.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    message: "Welcome to MiddleMan API",
  });
});

app.get("*", (req, res) => {
  res.status(404).json({
    status: 404,
    message: "Sorry! Can not be found!",
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server listening at: http://localhost:${PORT}`);
});

module.exports = app;
