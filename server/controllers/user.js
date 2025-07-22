import User from "../models/User";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/AsyncHandler";

export const sendFriendRequet=asyncHandler(async(req,res)=>{
    const {friend}=req.body

    const sender=await User.findById(req.user._id)
    const receiver=await User.findById(friend)
    if(!sender ||!receiver)throw new ApiError(404, "User not found");

    if (receiver.requests.includes(sender._id))throw new ApiError(400, "Friend request already sent");

    receiver.requests.push(sender._id);
    await receiver.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, null, "Friend request sent successfully"));
})

export const acceptFriendRequest=asyncHandler(async(req,res)=>{
    const {friend}=req.body

    const sender=await User.findById(req.user._id)
    const receiver=await User.findById(friend)
    if(!sender ||!receiver)throw new ApiError(404, "User not found");

    if (receiver.friends.includes(sender._id))throw new ApiError(400, "Already in friend list");

    receiver.friends.push(sender._id);
    receiver.requests = receiver.requests.filter(id => id.toString() !== sender._id.toString());
    await receiver.save({ validateBeforeSave: false });

    sender.friends.push(receiver._id);
    await sender.save({ validateBeforeSave: false });

    return res.status(200).json(new ApiResponse(200, null, "Friend request sent successfully"));
})

export const friendList = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("friends", "_id username");

  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(
    new ApiResponse(200, { friends: user.friends }, "Friends fetched successfully")
  );
});


export const friendSuggestions=asyncHandler(async(req,res)=>{
    
})