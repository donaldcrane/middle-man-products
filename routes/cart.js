const router = require("express").Router();
const Cart = require("../models/cart");
const Product = require("../models/product");
const verifyToken = require("../middlewares/verify-token");

/* Get Cart */
router.get("/cart", async (req, res) => {
try {
    let cart = await Cart.find({ __v: 0 })
    .populate({
        path: "items.productId",
    })
    .exec()
  
    if (!cart) {
        return res.status(400).json({
            status: false,
            message: "Cart not found",
        })
    }
    res.status(200).json({
        status: true,
        data: cart
    })

} catch (error) {
    res.status(500).json({
        success: false,
        message: error.message,
      });
}
})

/* Add To Cart */
router.post("/cart", verifyToken, async (req, res) => { 
    try {
        const { productId } = req.body;
    
        const quantity = parseInt(req.body.quantity);
      
      let cart = await Cart.findOne({ userId: req.decoded._id });

      let productDetails = await Product.findById(productId, { __v: 0 });
      if (!productDetails) {
          return res.status(500).json({
              status: false,
              message: "Not Found! Invalid request..."
          })
      } 
  
      if (cart) {
        /* cart exists for user */
        let itemIndex = cart.items.findIndex(p => p.productId == productId);
  
             /* Removes an item from the cart if the quantity is set to zero */
             if (itemIndex !== -1 && quantity <= 0) {
                cart.items.splice(itemIndex, 1);
                if (cart.items.length == 0) {
                    cart.subTotal = 0;
                } else {
                    cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
                }
            }
            /* Check if product exist, just add the previous quantity with the new quantity and update the total price */
            else if (itemIndex !== -1) {
                cart.items[itemIndex].quantity = cart.items[itemIndex].quantity + quantity;
                cart.items[itemIndex].total = cart.items[itemIndex].quantity * productDetails.price;
                cart.items[itemIndex].price = productDetails.price
                cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
            }
            /* Check if quantity is greater than 0 then add item to items array */
            else if (quantity > 0) {
                cart.items.push({
                    productId: productId,
                    quantity: quantity,
                    price: productDetails.price,
                    total: parseInt(productDetails.price * quantity)
                })
                cart.subTotal = cart.items.map(item => item.total).reduce((acc, next) => acc + next);
            }
            /* If quantity of price is 0 throw the error */
            else {
                return res.status(400).json({
                    status: fasle,
                    message: "Invalid request! Quantity of price can't zero..."
                })
            }
            let data = await cart.save();
            res.status(200).json({
                status: true,
                message: "Cart added Successful",
                data: data
            })
        }
        /* This creates a new cart and then adds the item to the cart that has been created */
        else {
            const cartData = {
                items: [{
                    productId: productId,
                    quantity: quantity,
                    total: parseInt(productDetails.price * quantity),
                    price: productDetails.price
                }],
                subTotal: parseInt(productDetails.price * quantity)
            }
          
            cart = new Cart(cartData);
            let data = await cart.save();

            res.json({
                data,
                status: true,
                message: "Successfully saved",
              });
        }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });

    /* Delete Cart */

    router.delete("/cart/:prodctId",  async (req, res) => {
        try {
          let deleteCart = await Cart.findOneAndDelete({
            _id: req.params.id,
          },
          { __v: 0 });
          if (deleteCart) {
            res.json({
              status: true,
              message: "Successfully deleted",
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
