const Review = require("../models/reviewModel");

//Add a review (Client
exports.addReview = async (req, res) => {
try {
    const { booking, provider, rating, comment } = req.body;
    const client = req.user.id; // Set client from authenticated user

    // Validate required fields
    if (!booking || !provider || !rating) {
      return res.status(400).json({ message: "Booking, provider, and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    if (comment && comment.length > 300) {
      return res.status(400).json({ message: "Comment cannot exceed 300 characters" });
    }

    // Attempt to create review
    const review = await Review.create({
      booking,
      provider,
      client,
      rating,
      comment: comment?.trim(),
    });

    res.status(201).json({
      message: "Review submitted successfully",
      review,
    });
  } catch (err) {
    // Handle duplicate review error (unique index)
    if (err.code === 11000) {
      return res.status(400).json({
        message: "You have already submitted a review for this booking",
      });
    }

    console.error("Create Review Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

//Get all reviews (Admin)
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("client provider", "name email");
    res.status(200).json({message:"success",reviews})
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single review
exports.getReviewById = async (req, res) => {
    try {
        const {id}=req.params
        const review =await Review.findById(id).populate("client provider", "name")
        if(!review)
            return res.status(400).json({ message: "Review not found" });
        res.status(200).json({message:"success",review})
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//Update review (Client/Admin)
exports.updateReview = async (req, res) => {
    try {
        const {id}=req.params
        const updates=req.body
        const review =await Review.findByIdAndUpdate(id,updates,{new:true})
        res.status(200).json({message:"success",review})
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//Delete review (Admin)
exports.deleteReview=async (req,res)=>{
     try {
        const {id}=req.params
        await Review.findByIdAndDelete(id)
        res.status(200).json({message:"Review deleted"})
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}