require("dotenv").config();      
const mongoose = require("mongoose");
const dbConnect = require("../db/dbConnect");
const User = require("../db/userModel");

async function run() {
  try {
    await dbConnect();          
    console.log("Connected from script");

    const users = await User.find({}).exec();

    for (let user of users) {
      if (!user.login_name) {
        user.login_name = user.first_name.toLowerCase();
        await user.save();
        console.log(`Updated ${user.first_name}`);
      }
    }
    console.log("DONE");
    process.exit(0);
  } catch (err) {
    console.error("ERROR:", err);
    process.exit(1);
  }
}

run();

