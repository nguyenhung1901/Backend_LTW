const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();
const checkLogin = require("../middleware/checkLogin");
router.get("/photosOfUser/:id", checkLogin, async (req, res) => {
  const userId = req.params.id;
  
  try {
    // Kiểm tra user có tồn tại không
    const userExists = await User.findById(userId).exec();
    if (!userExists) {
      return res.status(400).json({ 
        error: `User with _id: ${userId} not found` 
      });
    }
    // Lấy tất cả photos của user
    const photos = await Photo.find({ user_id: userId })
      .select("_id user_id comments file_name date_time")
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

