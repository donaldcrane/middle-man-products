const sgMail = require('@sendgrid/mail');
const dotenv = require("dotenv");
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);


  const sendVerificationEmail = (email) => {
       let hostURL;
       if (process.env.NODE_ENV === "production") {
        hostURL = "https://middle-man-products.herokuapp.com";
      } else { 
        hostURL = `http://localhost:${process.env.PORT || 3000}`;
       }
    const link = `${hostURL}/api/signup/verify/${email}`;
    // const link = `${localURL}/api/signup/verify/?token=${token}&email=${email}`;
    const msg = {
      to: email,
      from: process.env.FROM_EMAIL,
      subject: "Welcome to Middle-Man-Products! Confirm Your Email",
      html : `<strong>Please click the following link to confirm your email address: </strong> <a href="${link}" style ="text-decoration: none; padding: 5px 7px; color: black; background-color: rgb(103, 238, 114); border-radius: 3px; font-weight: bold;">VERIFY ME</a>`
    };
    
    //ES6
    sgMail
      .send(msg)
      .then(() => {}, error => {
        console.error(error);
     
        if (error.response) {
          console.error(error.response.body)
        }
      });
  }
  
  module.exports = sendVerificationEmail;


  