import User from "../models/user.model.js";
import Message from "../models/message.model.js"
import cloudinary from "../lib/cloudinary.js";

export const getUsersForSidebar = async (req,res) =>{
    try {
        
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: { $ne: loggedInUserId}}).select("-password");

        return res.status(200).json(filteredUsers);

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: " Internal Server Error "
        })
    }
}

export const getMessages = async(req,res) => {
    try {
         
        const {id: userToChatId} = req.params;
        const myId = req.user._id;
        const message = await Message.find({
            $or:[
                {senderId: myId, receiverId: userToChatId},
                {senderId: userToChatId, receiverId: myId}
            ]
        });

        return res.status(200).json(message);

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: " Internal Server Error "
        });
    }
}

export const sendMessage = async(req,res) => {
    try {
        const {text,image} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;

        //checking if the user is uploading a image and saving it to cloudinary and sending it to the receiver. 
        let imageUrl;
        if(image){
            //upload the base64 image to the cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        //creating the message 
        const newMessage =new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        //todo : realtime functionality

        return res.status(201).json(newMessage);

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: " Internal Server Error"
        });
    }
}