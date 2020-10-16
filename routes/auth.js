const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/verify-token");
const isAdmin = require("../middlewares/isAdmin")

router.post("/auth/signup", async (req, res) => {
  const { email } = req.body;
  const emailExist = await User.findOne({ email });
  if (emailExist) {
    return res.status(400).send({
      message: "Email already exists",
    });
  }

  // Hash passwords
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  // Create a new User
  const user = new User({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: hashedPassword,
    role: req.body.role,
  });

  try {
    const newUser = await user.save();
    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.TOKEN_SECRET, {
      expiresIn: 604800, // 1 week
    });
    res.json({
      status: true,
      message: "User successfully registered",
      newUser,
      token,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* Profile Route */
router.get("/auth/user", [verifyToken, isAdmin], async (req, res) => {
  try {
    let foundUser = await User.findOne({ _id: req.decoded._id });
    if (foundUser) {
      res.json({
        success: true,
        user: foundUser,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* Update profile */
router.put("/auth/user", verifyToken, async (req, res) => {
  try {
    let foundUser = await User.findOne({ _id: req.decoded._id });

    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    if (foundUser) {
      if (req.body.name) foundUser.name = req.body.name;
      if (req.body.email) foundUser.email = req.body.email;
      if (req.body.password) foundUser.password = hashedPassword;

      await foundUser.save();

      res.json({
        success: true,
        message: "Successfully Updated",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// LOGIN
router.post("/auth/login", async (req, res) => {
  // Checking if the email exist
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send({
      message: "Email is not found",
    });
  }
  // Check if Password is correct or not
  const match = await bcrypt.compare(password, user.password);

  // Create and assign token
  if (match) {
    const token = jwt.sign({ _id: user._id, role: user.role }, process.env.TOKEN_SECRET, {
      expiresIn: 604800, // 1 week
    });
    res.header("authorization", token).status(201).json({
      status: true,
      token,
      message: "logged in!",
      user,
    });
  }
  try {
    if (!match) {
      return res.status(400).json({
        message: "Invalid Password",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
