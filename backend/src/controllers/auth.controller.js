import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

export const signup = async(req,res) => {
   const {fullName,email,password} = req.body;

   try {

    if(!fullName || !email || !password){
        return res.status(400).json({
            message: " Please fill all the required fields "
        });
    }

    //checking the length of the password 
    if(password.length < 6){
        return res.status(400).json({
            message: "Password must be greater than 6 characters"
        });
    }

    const user = await User.findOne({email});
    if(user){
        return res.status(400).json({
            message: "This email is already in use "
        });
    }

    const hashedPassword = await bcrypt.hash(password,10);

    const newUser = new User({
        fullName,
        email,
        password:hashedPassword
    });

    if(newUser){
        //generate the token for the user 
        generateToken(newUser._id,res)
        await newUser.save();

        return res.status(200).json({
            _id: newUser._id,
            fullName: newUser.fullName,
            email: newUser.email,
            profilePic: newUser.profilePic,
        })
    }else{
        return res.status(400).json({
            message: " Invalid User data"
        });
    }
    
   } catch (error) {
    console.log(error.message);
    return res.status(500).json({
        message: "Internal Server Error, Please Try Again "
    })
   }
};


export const login = async(req,res) => {
    const { email, password} = req.body;

   try{ 
        //required fields 
        if(!email || !password){
        return res.status(400).json({
            message: " Please fill all the required fields "
        });
    }

    //checking for valid email
    const user = await User.findOne({email});

    if(!user){
        return res.status(400).json({
            message: " Invaild email Id or Password, please try again "
        });    
    }

    //checking for valid password 
    const validPassword = await bcrypt.compare(password, user.password);

    if(!validPassword){
        return res.status(400).json({
            message: " Invaild email Id or Password, please try again "
        });
    }

    generateToken(user._id , res);

    //after successfull login and generating token return 200 status response 
    return res.status(200).json({
        email: user.email,
        fullName: user.fullName,
        _id: user._id,
        profilePic: user.profilePic
    })
}
catch(error){
    console.log(error.message);
    return res.status(500).json({
        message: " Internal Server Error "
    });
}
};


export const logout = (req,res) => {
    try {
        res.cookie("jwt", "", {maxAge: 0});
        
        return res.status(200).json({
            message: " Logged Out Successfully"
        });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: " Internal Server error"
        });
    }
};

export const updateProfile = async(req,res) => {
    try {
        const {profilePic} = req.body;
        const userId = req.user._id;

        if(!profilePic){
            return res.status(400).json({
                message: " Profile pic is required "
            })
        }

        const uploadResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, {profilePic:uploadResponse.secure_url}, {new:true});

        res.status(200).json(updatedUser);
        
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: " Internal Server Error "
        });
    }
}


export const checkAuth = (req,res) => {
    try {
         return res.status(200).json(req.user);
        
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            message: " Internal Server Error"
        })
    }
}