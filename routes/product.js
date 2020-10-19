const router = require("express").Router();
const Product = require("../models/product");
const upload = require("../middlewares/upload-photo");

router.post("/products", upload.single("photo"), async (req, res) => {
  try {
    let product = new Product();
    product.categoryID = req.body.categoryID;
    product.ownerID = req.body.ownerID;
    product.title = req.body.title;
    product.description = req.body.description;
    product.photo = req.file.location;
    product.price = req.body.price;
    product.stockQuantity = req.body.stockQuantity;

    await product.save();
    res.json({
      product,
      status: true,
      message: "Successfully saved",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/products", async (req, res) => {
  try {
    let { title, page, limit } = req.query;
    page = page < 1 ? 1 : page;
    limit = 8;
    let search = title
      ? { title: { $regex: new RegExp(title), $options: "i" } }
      : {};

    // get total documents in the Products collection
    let count = await Product.countDocuments();
    let totalPages = Math.ceil(count / limit);
    page = page > totalPages ? totalPages : page;

    let products = await Product.find(search, { __v: 0 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("owner category")
      .populate("reviews", "rating")
      .collation({locale: "en" })
      .sort({"title": 1})
      .exec();

    // return response with products, total pages, and current page
    res.json({
      success: true,
      products,
      totalPages: totalPages,
      currentPage: page,
      totalProducts: count,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    let product = await Product.findOne({ _id: req.params.id })
      .populate("owner category")
      .populate("reviews", "rating")
      .exec();
    res.json({
      success: true,
      product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put("/products/:id", upload.single("photo"), async (req, res) => {
  try {
    let product = await Product.findOneAndUpdate(
      {
        _id: req.params.id,
      },
      {
        $set: {
          title: req.body.title,
          category: req.body.categoryID,
          photo: req.file.location,
          price: req.body.price,
          description: req.body.description,
          owner: req.body.ownerID,
          stockQuantity: req.body.stockQuantity,
        },
      },
      {
        upsert: true,
      }
    );

    res.json({
      success: true,
      updateProduct: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.delete("/products/:id", upload.single("photo"), async (req, res) => {
  try {
    let deleteProduct = await Product.findOneAndDelete({
      _id: req.params.id,
    });
    if (deleteProduct) {
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

// Total price of each product in the database
router.get("/totalprice/products", async (req, res) => {
  try {
  
    let products = await Product.find({ __v: 0 })
      console.log("products", products);
    let result = products.reduce((acc, c) => {
        console.log( acc );
        console.log(c.title);
      acc[c.title] = (acc[c.title] || 0) + c.price
      return acc
    }, {})
    console.log("result count" ,result)

    // return response with products, total pages, and current page
    res.json({
      success: true,
      products,
      totalPrice: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
