const Cart = require("../models/cart");
exports.cart = async () => {
    const carts = await Cart.find().populate(
        {
            path: "items.productId",
            select: "name price total"
        }
        ).exec()
    console.log("cat rep", carts);
    return carts;
};