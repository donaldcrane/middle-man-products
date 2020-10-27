const router = require("express").Router();
const User = require("../models/user");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


router.post("/auth/recover", async(req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email })
        if (!user)
         return res.status(401).json({
             message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.'
            });

        //  Generate and set password reset token
          user.generatePasswordReset();
            const userSaved = await user.save();

            let link = "http://" + req.headers.host + "/api/auth/reset/" + user.resetPasswordToken;
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
                message: 'A reset email has been sent to ' + user.email + '.'
            });
            // sgMail.send(mailOptions, (error, result) => {
            //     if (error) 
            //     return res.status(500).json({
            //         message: error.message
            //     });

            //     res.status(200).json({
            //         message: 'A reset email has been sent to ' + user.email + '.'
            //     });
            // });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
          });
    }
})

module.exports = router;
