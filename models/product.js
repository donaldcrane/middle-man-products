const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Owner",
    },
    title: String,
    description: String,
    photo: String,
    price: Number,
    stockQuantity: { type: Number, default: 1 },
    sold: {
      type: Number,
      maxlength: 255,
      default: 0,
    },
    //store the id of the newly created Review
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { timestamps: true },
  {
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

ProductSchema.virtual("averageRating").get(function () {
  if (this.reviews.length > 0) {
    let sum = this.reviews.reduce((total, review) => {
      console.log("Review", review);
      return total + review.rating;
    }, 0);
    return sum / this.reviews.length;
  }

  return 0;
});

// ProductSchema.method("toJSON", function () {
//   const { __v, _id, ...object } = this.toObject();
//   object.id = _id;
//   return object;
// });

module.exports = mongoose.model("Product", ProductSchema);
