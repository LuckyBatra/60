const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../Models/listing.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../Controller/listing.js");
const multer = require("multer");
const upload = multer({ 
    dest: "uploads/", 
    limits: { fileSize: 5 * 1024 * 1024 } // Set file size limit (e.g., 5MB)
});

// Route for uploading listing with Multer error handling
router.route("/")
    .get(wrapAsync(listingController.index))
    .post(
        isLoggedIn,
       
        upload.single("listing{image}"),
        validateListing,
        wrapAsync(listingController.createListing)
    );
    //             upload.single("listingImage"), // Adjust field name to match the form
    //     (err, req, res, next) => {
    //         // Handle Multer errors
    //         if (err instanceof multer.MulterError) {
    //             if (err.code === "LIMIT_FILE_SIZE") {
    //                 return res.status(400).send("File size too large. Maximum size is 5MB.");
    //             } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
    //                 return res.status(400).send("Unexpected file field.");
    //             }
    //             return res.status(400).send(`Multer error: ${err.message}`);
    //         } else if (err) {
    //             // General error handling
    //             return res.status(500).send("An error occurred during the upload.");
    //         }
    //         next();
    //     },
    //     (req, res) => {
    //         // Success response after file upload
    //         if (!req.file) {
    //             return res.status(400).send("Please upload a file.");
    //         }
    //         res.send({
    //             message: "File uploaded successfully!",
    //             file: req.file,
    //         });
    //     }
    // );

// New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

router.route("/:id")
    .get(wrapAsync(listingController.ShowListing))
    .put(isLoggedIn, isOwner, validateListing, listingController.updateListing)
    .delete(isOwner, listingController.destroyListing);

// Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, listingController.RenderEditForm);

module.exports = router;


// const express = require("express");
// const router = express.Router();
// const wrapAsync = require("../utils/wrapAsync.js");
// const Listing = require("../Models/listing.js");
// const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
// const listingController = require("../Controller/listing.js");
// const multer  = require('multer');
// const {storage} = require("../cloudConfig.js");
// const upload = multer({ storage });

// router.route("/")
// .get(wrapAsync(listingController.index))
// .post (upload.single ('listing {image}'), (req, res) => {
//     res.send(req.file);
// });

// //New Route
// router.get("/new", isLoggedIn, listingController.renderNewForm);

// router.route("/:id")
// .get(wrapAsync (listingController.ShowListing))
// .put(isLoggedIn, isOwner, validateListing, (listingController.updateListing ))
// .delete(isOwner, listingController.destroyListing);

// //Edit Route
// router.get("/:id/edit", isLoggedIn, isOwner, (listingController.RenderEditForm));

// module.exports = router;