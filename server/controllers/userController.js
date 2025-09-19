import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";

//signup 
export const signup = async (req, res) => {
  const { email, fullName, password, bio } = req.body;

  try {
    if (!fullName || !email || !password || !bio) {
      return res.json({ success: false, message: "Missing Details" });
    }

    const user = await User.findOne({ email }); 

    if (user) {
      return res.json({ success: false, message: "Account already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      fullName,
      password: hashedPassword,
      bio,
    });

    const token = generateToken(newUser._id);
    res.json({success: true, userData: newUser, token, message: "Account created successfully"});

  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};


//login
export const login = async (req, res) => {
    try {
    const {email, password} = req.body;
    
    const userData = await User.findOne({email});
    const isPasswordCorrect = await bcrypt.compare(password, userData.password);

    if(!isPasswordCorrect){
        return res.json({success: false, message: "Invalid Credentials"});
    }

    const token = generateToken(userData._id);
    console.log("token", token);
    console.log("userData", userData);
    res.json({success: true, userData, token, message: "Login successful"})

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}


//controller to check if user is auhenticated 
export const checkAuth = (req, res) => {
  console.log("checkauth req.user", req.user);
    res.json({success: true, user: req.user});
}

//controller to update the user profile details
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id;

        let updatedUser;

        if(!profilePic){
            updatedUser = await User.findByIdAndUpdate(userId, {bio, fullName}, {new: true});
        }else{
            const upload = await cloudinary.uploader.upload(profilePic);

            updatedUser = await User.findByIdAndUpdate(userId, {profilePic: upload.secure_url, bio, fullName}, {new: true});
        }
        // res.json({success: true, user: updatedUser});
        const { password, ...userWithoutPassword } = updatedUser._doc;
        console.log("userWithoutPassword", userWithoutPassword);
        res.json({ success: true, user: userWithoutPassword });

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}
