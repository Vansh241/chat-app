import JWT from "jsonwebtoken"
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
    try {
        // const token = req.headers.token;

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.json({ success: false, message: "No token provided" });
        }
        const token = authHeader.split(" ")[1];

        console.log("protect route token", token);
        

        const decoded = JWT.verify(token, process.env.JWT_SECRET);

        //user details except password
        const user = await User.findById(decoded.userId).select("-password");
        console.log("protect route user", user);

        if(!user) return res.json({success: false, message: "User not found"})

        req.user = user;
        next();
    } catch (error) {
        return res.json({success: false, message: error.message});
    }
}