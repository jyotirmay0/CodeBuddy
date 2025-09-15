import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";
import dotenv from "dotenv"
dotenv.config()

const UserSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        min:6,
        max:30
    },
    name:{
        type:String,
        default:""
    },
    dob:{
        type:Date,
    },
    location:{
        type:String,
    },
    pic:{
        type: String,
        default: ""
    },
    bio:{
        type: String,
        default:""
    },
    skills:{
        type:[String],
        enum:[
                "JavaScript", "Python", "Java", "C++", "HTML", "CSS", "React", "Node.js", "Express.js", "MongoDB","SQL", "TypeScript", "Git", "Docker", "Kubernetes", "AWS", "Azure", "Firebase",
                "UI/UX Design", "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator",
                "Communication", "Teamwork", "Leadership", "Problem-solving", "Time management", "Public speaking","Project management", "Agile", "Scrum", "Data Analysis", "Machine Learning", "Deep Learning","Cybersecurity", "Networking", "Linux", "Cloud Computing", "DevOps", "CI/CD","Writing", "Editing", "Blogging", "Marketing", "SEO", "Sales", "Customer Support",
                "Video Editing", "3D Modeling", "Animation", "Game Development", "AR/VR"
            ],
        default:[]
    },
    interests:{
        type:[String],
        enum:[
                "Technology", "Science", "Artificial Intelligence", "Machine Learning", "Quantum Computing","Blockchain", "Cryptocurrency", "Cybersecurity", "Startups", "Entrepreneurship","Finance", "Stock Market", "Personal Development", "Psychology", "Philosophy","History", "Geopolitics", "Literature", "Space Exploration", "Astronomy",
                "Climate Change", "Sustainability", "Photography", "Travel", "Food", "Fitness",
                "Meditation", "Yoga", "Music", "Cinema", "Video Games", "E-Sports",
                "Art", "Design", "Fashion", "Cars", "Motorsports", "Animals", "Wildlife",
                "Education", "Learning Languages", "DIY Projects", "Open Source", "Volunteering",
                "Robotics", "Biotech", "Neuroscience", "Data Privacy", "Human Rights"
            ],
        default:[]
    },
    hobbies:{
        type:[String],
        enum:[
                "Reading", "Writing", "Drawing", "Painting", "Photography", "Cooking", "Baking", 
                "Gardening", "Fishing", "Hiking", "Camping", "Cycling", "Running", "Swimming", 
                "Singing", "Playing Guitar", "Playing Piano", "Drumming", "Dancing", "Chess", 
                "Board Games", "Collecting Stamps", "Collecting Coins", "Bird Watching", "Origami", 
                "Knitting", "Calligraphy", "Blogging", "Podcasting", "Filmmaking", "3D Printing", 
                "Traveling", "Exploring Cafes", "Watching Movies", "Watching Anime", "Playing Video Games","Skateboarding", "Snowboarding", "Surfing", "Martial Arts", "Yoga", "Meditation", 
                "DIY Projects", "Woodworking", "Home Brewing", "Journaling", "Astrophotography", 
                "Model Building", "Rock Climbing", "Scuba Diving", "Magic Tricks", "Fantasy Sports"
            ],
        default:[]
    },
    projects:{
        type:[String]
    },
    socials:{
        type:[String]
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    contact:{
        type:Number,
        default:0,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    verified:{
        type:Boolean,
        default:false
    },
    isOnline:{
        type:Boolean,
        default:false
    },
    buddies: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    requests:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    projects: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: "Group" }],
    chatRooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "MessageRoom" }],
    refreshToken:{
        type:String,
        default:""
    }
},{timestamps:true})

UserSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password, 10)
    next()
})

UserSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password, this.password)
}

UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id.toString()
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    );
};

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id.toString()
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

const User=mongoose.model("User",UserSchema)
export default User