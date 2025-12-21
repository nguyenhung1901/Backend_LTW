const express = require("express");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();
router.get("/photosOfUser/:id", async(req, res)=>{
    const userExists = await User.findById(userId).exec();
    if (!userExists) {
      return res.status(400).json({ 
        error: `User with _id: ${userId} not found` 
      });
    }
    const photos = await Photo.find({user_id: userId})
        .select("_id user_id comments file_name date_time")
        .exec()
    const processedPhotos = await Promise.all(
        photos.map(async (photo)=>{
            
        })
    )
});
router.post("/", async (request, response) => {
  
});

router.get("/", async (request, response) => {
  
});

module.exports = router;
