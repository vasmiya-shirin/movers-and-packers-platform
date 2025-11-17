const express = require("express");
const router = express.Router();
const upload = require("../middlewares/multer");
const cloudinary = require("../config/cloudinary");

router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const result = await cloudinary.uploader.upload_stream(
            { folder: "movers" },
            (error, uploadedFile) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ message: "Cloudinary error" });
                }
                return res.json({ url: uploadedFile.secure_url });
            }
        );

        // Pipe buffer → Cloudinary stream
        result.end(req.file.buffer);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Upload failed" });
    }
});

module.exports = router;
