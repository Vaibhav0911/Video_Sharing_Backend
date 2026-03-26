import { AsyncHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { cloudinary } from "../utils/uploadToCloudinary.js";
import { Users } from "../models/users.model.js";

const userRegister = AsyncHandler(async (req, res) => {

    const {username, fullname, email, password} = req.body;
    
    if(username === "" || fullname === "" || email === "" || password === "")        throw new ApiError(400, "All field are required!");
    
    let profileImagePath = req.files?.profileimage?.[0].path;
    let coverImagePath = req.files?.coverimage?.[0].path;
    let profileimageUrl = "";
    let coverimageUrl = "";
    
    if(profileImagePath){
        const profileimage = await cloudinary.uploader.upload(profileImagePath);
        profileimageUrl = profileimage.secure_url;
    }

    if(coverImagePath){
        const coverimage = await cloudinary.uploader.upload(coverImagePath);
        coverimageUrl = coverimage.secure_url;
    }
    
    const user = await Users.create({
        username,
        fullname,
        email,
        password,
        profileimage: profileimageUrl,
        coverimage: coverimageUrl
    })

    const registeredUser = await Users.findById(user._id).select("-password -refreshtoken");
    
    res.status(200).json(new ApiResponse(200, "User Register Successfully", registeredUser));
})

export {userRegister};