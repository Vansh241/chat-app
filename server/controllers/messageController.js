import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js"


//get all users except the logged in user
export const getUsersForSidebar = async (req, res) => {
    try {
        const userId = req.user._id;
        //all users whose id is not equal to userId
        const filteredUsers = await User.find({_id: {$ne: userId}}).select("-password");

        //count number of messages not seen
        const unseenMessages = {};
        const promises = filteredUsers.map(async (user)=>{
            const messages = await Message.find({senderId: user._id, receiverId: userId, seen: false});
            if(messages.length > 0){
                unseenMessages[user._id] = messages.length;
            }
        })
        await Promise.all(promises);
        res.json({success: true, users: filteredUsers, unseenMessages});
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

//get all messages for selected user
export const getMessages = async (req, res) => {
    try {
        const { id: selectedUserId } = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: selectedUserId},
                {senderId: selectedUserId, receiverId: myId},
            ]
        })

        //updating seen property
        await Message.updateMany({senderId: selectedUserId, receiverId: myId}, {seen: true});

        res.json({success: true, messages});
        
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}


//api to mark msg as seen using message id
export const markMessageAsSeen =async (req, res) => {
    try {
        const { id } = req.params;
        await Message.findByIdAndUpdate(id, {seen: true});

        res.json({success: true});
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}


//send message to selected user
export const sendMessage = async (req, res) => {
    try {
        const { image, text } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        console.log("Incoming image:", image ? image.substring(0,100) : "no image");


        let imageUrl = "";
        if (image) {
            try {
                const uploadResponse = await cloudinary.uploader.upload(image);
                imageUrl = uploadResponse.secure_url;
            } catch (err) {
                console.error("Cloudinary upload error:", err);
                return res.json({ success: false, message: "Image upload failed" });
            }
        }

        const newMessage = await Message.create({
            text: text || "",
            image: imageUrl,
            senderId,
            receiverId
        });

        //receiverId will instantly see this msg 
        //Emit the message to the receiver's socket
        const receiverSocketId = userSocketMap[receiverId];
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.json({success: true, newMessage});
        
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}