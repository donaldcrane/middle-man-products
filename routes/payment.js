const router = require("express").Router();
const Cart = require("../models/cart");
const Product = require("../models/product");
const verifyToken = require("../middlewares/verify-token");
const { initializePayment, verifyPayment } = require('../helper/paystack');

router.post("/paystack/pay", async (req, res) => {
    try {
      let { price, quantity, productId } = req.body;

      let subTotal = parseFloat(price) * parseInt(quantity)
     
      const paystack_data = {
        amount: subTotal * 100,
        email: "jerry.aaron45@gmail.com",
        productId: productId
      };
    
      console.log("product", paystack_data.productId);

      let response = await initializePayment(paystack_data);

      let productDetails = await Product.findById(productId);
      const items = [{
          productId: productDetails._id, 
          title: productDetails.title,
          price: productDetails.price,
          quantity: quantity ,
          total: subTotal,
      }
    ]

      const payload = {
        userId: "5f8c42e84179f7001756b6e0",
        subTotal: subTotal,
        items,
        reference: response.data.reference,
        status: 'pending',
      };

    
     const saveCart = new Cart(payload);

       await saveCart.save();

      if (response) {
        return res.json({
          message: response.data.authorization_url,
        });
      }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
          });
    }
   })

   router.get("/paystack/callback", async (req, res) => {
   
        try {
            const { trxref } = req.query;

            if (!trxref) {
              console.log('No transaction reference found');
            }
        
          const payment_status = await verifyPayment(trxref);
          console.log("payment status", payment_status);
    
          let { status, reference, amount, customer } = payment_status.data.data;
          let customerDetail = payment_status.data.data.customer
          console.log("customer", customerDetail);
          // customerDetail.email
          const { email } = customerDetail;
    
          
        } catch (error) {
          console.log('error', error);
        }
   })

module.exports = router;