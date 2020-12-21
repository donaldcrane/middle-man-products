const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.post("/auth/recover", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({
        message:
          "The email address " +
          req.body.email +
          " is not associated with any account. Double-check your email address and try again.",
      });

    //  Generate and set password reset token
    user.generatePasswordReset();
    let hostURL = "https://middle-man-products.herokuapp.com";
    //   let hostURL = `http://localhost:${process.env.PORT || 3000}`
    await user.save();
    const link = `${hostURL}/api/auth/reset/${user._id}-${user.resetPasswordToken}`;

    const mailOptions = {
      to: user.email,
      from: process.env.FROM_EMAIL,
      subject: "Password change request",
      text: `Hi ${user.firstName} \n 
            Please click on the following link ${link} to reset your password. \n\n 
            If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };
    await sgMail.send(mailOptions);
    res.status(200).json({
      message: "A reset email has been sent to " + user.email + ".",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/auth/reset/:id-:token", async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;

    const user = User.findOne({
      _id: id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res
        .status(401)
        .json({ message: "Password reset token is invalid or has expired." });

    //Set the new password
    user.password = req.body.password;
    console.log("object", user.password);

    const payload = jwt.decode(token, user.password);
    console.log("payload", payload);
    console.log("payload id", payload.user._id);
    if (payload.user._id) {
      bcrypt.genSalt(10, function (err, salt) {
        console.log("err", err);
        if (err) return;
        bcrypt.hash(password, salt, function (err, hash) {
          if (err) return;
          User.findOneAndUpdate({ _id: id }, { password: hash })
            .then(() => res.status(202).json("Password changed accepted"))
            .catch((err) => res.status(500).json(err.message));
        });
      });
    }

    // send email
    const mailOptions = {
      to: user.email,
      from: process.env.FROM_EMAIL,
      subject: "Your password has been changed",
      text: `Hi ${user.firstName} \n 
                    This is a confirmation that the password for your account ${user.email} has just been changed.\n`,
    };
    sgMail
      .send(mailOptions)
      .then(() => {
        res
          .status(200)
          .json({ message: "Your password has been updated successfully." });
      })
      .catch((error) => {
        console.log("error", error);
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
