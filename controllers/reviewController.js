const Review = require("../models/reviewModel");

//Add a review (Client
exports.addReview = async (req, res) => {
  try {
    const { booking, provider, rating, comment } = req.body;
    const review = new Review({
      booking,
      provider,
      client: req.user.id,
      rating,
      comment,
    });
    await review.save();
    res.status(200).json({ message: "success", review });
  } catch (error) {
    res.status(500).json({ message: error.message });
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