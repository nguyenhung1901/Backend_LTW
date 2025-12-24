const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();
const checkLogin = require("../middleware/checkLogin");

/**
 * POST /api/comment/:photo_id
 * Thêm comment vào photo
 */
router.post("/:photo_id", checkLogin, async (req, res) => {
  const { photo_id } = req.params;
  const { comment } = req.body;
  const user_id = req.session.user._id;

  if (!comment || comment.trim().length === 0) {
    return res.status(400).json({ error: "Comment cannot be empty" });
  }

  try {
    const photo = await Photo.findById(photo_id).exec();
    if (!photo) {
      return res.status(400).json({ error: "Photo not found" });
    }

    // Thêm comment mới vào array
    const newComment = {
      comment: comment.trim(),
      date_time: new Date(),
      user_id: user_id,
    };

    photo.comments.push(newComment);
    await photo.save();

    const addedComment = photo.comments[photo.comments.length - 1];
    
    res.status(200).json({
      _id: addedComment._id,
      comment: addedComment.comment,
      date_time: addedComment.date_time,
      user_id: addedComment.user_id,
    });
  } catch (err) {
    console.error("Comment error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;