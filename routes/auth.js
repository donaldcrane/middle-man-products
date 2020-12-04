const router = require("express").Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/verify-token");
const isAdmin = require("../middlewares/isAdmin");
const sendVerificationEmail = require("./../helper/sendgrid");
const sgMail = require("@sendgrid/mail");
const dotenv = require("dotenv");
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post("/auth/signup", async (req, res) => {
  try {
    const { email } = req.body;
    const Email = email.toLowerCase();
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
    const newUser = await user.save();
    const token = jwt.sign({ user }, process.env.TOKEN_SECRET, {
      expiresIn: 604800, // 1 week
    });
    await sendVerificationEmail(Email);
    res.cookie("auth_token", token);
    // let hostURL;
    // hostURL = "https://middle-man-products.herokuapp.com";
    // const link = `${hostURL}/api/auth/signup/verify/${email}`;
    // const msg = {
    //   to: email,
    //   from: process.env.FROM_EMAIL,
    //   subject: "Welcome to Middle-Man-Products! Confirm Your Email",
    //   html : `<strong>Please click the following link to confirm your email address: </strong> <a href="${link}" style ="text-decoration: none; margin: 3px; padding: 5px 7px; color: black; background-color: rgb(103, 238, 114); border-radius: 3px; font-weight: bold;">VERIFY ME</a>`
    // };

    // //ES6
    // sgMail
    //   .send(msg)
    //   .then(() => {}, error => {
    //     console.error(error);

    //     if (error.response) {
    //       console.error(error.response.body)
    //     }
    //   });

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
router.get("/auth/user", verifyToken, async (req, res) => {
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

/* Get all users */
router.get("/auth/users", [verifyToken, isAdmin], async (req, res) => {
  try {
    let foundUser = await User.find();
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

/* Delete single users */
router.delete("/auth/users/:id", [verifyToken, isAdmin], async (req, res) => {
  try {
    let foundUser = await User.deleteOne({
      _id: req.params.id,
    });
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
/* Delete all users */
router.delete("/auth/users", [verifyToken, isAdmin], async (req, res) => {
  try {
    let foundUser = await User.deleteMany();
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
    const token = jwt.sign(
      { _id: user._id, email: user.email, role: user.role },
      process.env.TOKEN_SECRET,
      {
        expiresIn: 604800, // 1 week
      }
    );
    res.cookie("auth_token", token);
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

router.get("/signup/verify/:email", async (req, res) => {
  try {
    const { email } = req.params;

    const user = await User.findOne({ email });
    console.log("user token", user);
    const update = await User.findOneAndUpdate(
      {
        email,
      },
      {
        $set: {
          verified: true,
        },
      }
    );
    console.log("update", update);
    if (user.verified) {
      return res.status(400).send({
        success: false,
        message: "oops! User already verified.....",
      });
    }
    user.verified = true;
    console.log("verified", user);
    await user.save();
    return res.status(200).send({
      success: true,
      message: "The account has been verified. Please log in.",
    });
  } catch (error) {
    console.log("error", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/users/logout", async (req, res) => {
  res.clearCookie("auth-token");
  res.status(200).json({
    message: "loged out successfully",
  });
});

// Logout
router.get("/auth/logout", verifyToken, async (req, res) => {
  await User.findOneAndUpdate(
    { id: req.decoded._id }
    // { token: "" }
  );
  res.clearCookie("auth_token");
  res.status(200).json({
    status: true,
    message: "log out successfully",
  });
});
module.exports = router;
