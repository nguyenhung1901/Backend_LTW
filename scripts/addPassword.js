require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dbConnect = require("../db/dbConnect")
const User = require("../db/userModel");
async function run() {
    try{
        await dbConnect();
        console.log("Connected from scipt");
        const users = await User.find({}).exec();
        for(let user of users){
            if(!user.password){
                const hashedPassword = await bcrypt.hash("weak",10);
                user.password = hashedPassword;
                await user.save();
                console.log(`Updated password for ${user.first_name}`);
            }
        }
        console.log("Done");
        process.exit(0);
    }
    catch(err){
        console.error("Error:", err);
        process.exit(1);
    }
}
run();