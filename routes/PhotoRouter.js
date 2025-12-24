const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();
const checkLogin = require("../middleware/checkLogin");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../images");
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "_" + file.originalname.replace(/\s/g, "_");
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  }
});

/**
 * POST /api/photo/new
 * Upload new photo
 */
router.post("/new", checkLogin, upload.single("photo"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const user_id = req.session.user._id;

  try {
    const newPhoto = new Photo({
      file_name: req.file.filename,
      date_time: new Date(),
      user_id: user_id,
      comments: []
    });

    await newPhoto.save();

    res.status(200).json({
      _id: newPhoto._id,
      file_name: newPhoto.file_name,
      date_time: newPhoto.date_time
    });
  } catch (err) {
    console.error("Upload error:", err);
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: "Failed to save photo" });
  }
});

/**
 * GET /api/photo/photosOfUser/:id
 */
router.get("/photosOfUser/:id", checkLogin, async (req, res) => {
  const userId = req.params.id;
  
  try {
    const userExists = await User.findById(userId).exec();
    if (!userExists) {
      return res.status(400).json({ 
        error: `User with _id: ${userId} not found` 
      });
    }

    const photos = await Photo.find({ user_id: userId })
      .select("_id user_id comments file_name date_time")
      .sort({ date_time: -1 })
      .exec();

    const processedPhotos = await Promise.all(
      photos.map(async (photo) => {
        const photoObj = photo.toObject();
        
        if (photoObj.comments && photoObj.comments.length > 0) {
          photoObj.comments = await Promise.all(
            photoObj.comments.map(async (comment) => {
              const commentUser = await User.findById(comment.user_id)
                .select("_id first_name last_name")
                .exec();
              return {
                _id: comment._id,
                comment: comment.comment,
                date_time: comment.date_time,
                user: commentUser ? commentUser.toObject() : null,
              };
            })
          );
        }
        
        return photoObj;
      })
    );
    
    res.status(200).json(processedPhotos);
  } catch (error) {
    console.error("Error fetching photos:", error);
    res.status(400).json({ 
      error: `Invalid user id: ${userId}` 
    });
  }
});

module.exports = router;
