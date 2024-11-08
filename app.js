const express= require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./Models/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema}=require("./schema.js");
const Review = require("./Models/review.js");
const Joi = require('joi'); // CommonJS



const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connected to Data Base");
     })
     .catch((err) => {
        console.log(err);
     });

     async function main(){
        await mongoose.connect(MONGO_URL);
     }

     app.set("view engine", "ejs");
     app.set("views", path.join(__dirname,"views"));
     app.use(express.urlencoded({ extended: true}));
     app.use(methodOverride("_method"));
     app.engine("ejs", ejsMate);
     app.use(express.static(path.join(__dirname,"/public")));

app.get("/", (req,res) => {
    res.send("Hi, I am root");
});    

const validateListing = (req, res,next) => {
    let { error } = listingSchema.validate(req.body);
    if (error) {
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    } else {
        next();
    }
    };

    const validateReview = (req, res,next) => {
        let { error } = reviewSchema.validate(req.body);
        if (error) {
            let errMsg = error.details.map((el) => el.message).join(",");
            throw new ExpressError(400, errMsg);
        } else {
            next();
        }
        };


//Index Route
app.get("/listings", async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
});

//New Route
app.get("/listings/new", (req, res)=> {
    res.render("listings/new.ejs");
});

// Show Route with error handling and potential template data
app.get("/listings/:id", async (req, res) => {
    let { id } = req.params;
    try {
      const listing = await Listing.findById(id).populate("reviews");
      if (!listing) {
        return res.status(404).send("Listing not found."); // Handle not found case
      }
      // You can add additional data for the template here (optional)
      res.render("listings/show.ejs", { listing }); // Use 'listing'
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error"); // Handle unexpected errors
    }
  });

// Create Route
app.post("/listings", async (req, res, next) => {
    try {
        const newListing = new Listing (req.body.listing);     
        await newListing.save();
    res.redirect("/listings");
    } catch (err) {
        next(err);
    }
    });
    


//Edit Route
app.get("/listings/:id/edit", async (req, res) => {
    const { id } = req.params;
  
    try {
      const listing = await Listing.findById(id);
  
      if (!listing) {
        return res.status(404).render("error", { message: "Listing not found" });
      }
  
      // Implement authorization checks here (e.g., check user roles, permissions)
  
      res.render("listings/edit.ejs", { listing });
    } catch (err) {
      console.error(err);
      res.status(500).render("error", { message: "Internal server error" });
    }
  });

  // Update Route
 app.put("/listings/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, imageUrl, price, country, location } = req.body.listing;

        const updatedListing = await Listing.findByIdAndUpdate(id, {
            title,
            description,
            image: { url: imageUrl },
            price,
            country,
            location
        }, { new: true });

        if (!updatedListing) {
            return res.status(404).send("Listing not found.");
        }
        res.redirect(`/listings/${id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});

//Delete Route
    app.delete("/listings/:id", async (req,res ) =>  {
        let { id } = req.params;
        let deletedListing = await Listing.findByIdAndDelete (id);
        console.log(deletedListing);
        res.redirect("/listings");
    });

//Reviews Post Route

app.post("/listings/:id/reviews", validateReview, async (req, res) => {
    let listing = await Listing.findById(req.params.id);
    if (!listing) {
        return res.status(404).send("Listing not found");
    }

    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing.id}`);
});



//Delete Review Route
app.delete("/listings/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    let { id, reviewId } = req.params;
    

    await Listing.findByIdAndUpdate( {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
})
);


    app.all("*", (req, res, next) => {
        next(new ExpressError(404, "Page Not found!"));
    });

    app.use((err, req, res, next) => {
        res.send("Something went wrong!");
    });

    app.listen(8080, () => {
        console.log("server is listening to port 8080");
    });


