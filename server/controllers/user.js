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


export const friendSuggestions = asyncHandler(async (req, res) => {
  const currentUser = await User.findById(req.user._id);
  if (!currentUser) throw new ApiError(404, "User not found");

  const excludeIds = [
    req.user._id.toString(),
    ...currentUser.friends.map(id => id.toString()),
  ];

  const candidateUsers = await User.find({
    _id: { $nin: excludeIds },
    $or: [
      { skills: { $in: currentUser.skills } },
      { interests: { $in: currentUser.interests } },
      { hobbies: { $in: currentUser.hobbies } }
    ]
  }, "_id username skills interests hobbies");

  const scoredUsers = candidateUsers.map(user => {
    const skillMatches = user.skills.filter(skill => currentUser.skills.includes(skill)).length;
    const interestMatches = user.interests.filter(interest => currentUser.interests.includes(interest)).length;
    const hobbyMatches = user.hobbies.filter(hobby => currentUser.hobbies.includes(hobby)).length;

    const score = (3 * skillMatches) + (2 * interestMatches) + (1 * hobbyMatches);

    return {
      _id: user._id,
      username: user.username,
      score,
    };
  });

  const suggestions = scoredUsers
    .filter(u => u.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return res.status(200).json(
    new ApiResponse(200, { suggestions }, "Friend suggestions fetched successfully")
  );
});

export const userDetails=asyncHandler(async(req,res)=>{
  const {id}=req.body
  const user=await User.findById(id).select("-password -verified -_id -createdAt -updatedAt")
  if(!user)throw new ApiError(401,"User not found");
  return res.status(200).json(
    new ApiResponse(200,{user},"User fetched successfully")
  )
})