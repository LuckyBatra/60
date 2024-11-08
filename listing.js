const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  price: Number,
  location: String,
  country: String,

  image: {
    type: new Schema({
      url: {
        type: String,
        required: true // Mark URL as required
      },
      // Add other optional properties like alt text or source
      alt: String,
      source: String
    })
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

listingSchema.post("findOneAndDelete", async (listings) => {
  if (listings) {await Review.deleteMany({_id: { $in: Listing.reviews }});
 }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;