import express from "express";
import User from "../models/User.js"
const router = express.Router();
import jwt from "jsonwebtoken"

const genToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "15d" });
}

router.post("/register", async (req, res) => {
    try {

        const { email, username, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "password should be atleast 6 characters long" })
        }

        if (username.length < 3) {
            return res.status(400).json({ message: "Username must be atlest four characters long" })
        }

        const existUsername = await User.findOne({ username });

        if (existUsername) {
            return res.status(400).json({ message: "Username already exist, please login instead" })
        }

        // check if user exists
        const existUser = await User.findOne({ username })
        if (existUser) return res.status(400).json({ message: "Username already exists, please login instead" })


        const existEmail = await User.findOne({ email })
        if (existEmail) return res.status(400).json({ message: "User with this email already exists, please login instead" })

        // get random avatar
        const profileImage = `https://api.dicebear.com/9.x/avataaars/svg?seed=${username}`

        const user = new User({
            email,
            username,
            password,
            profileImage,
        })



        await user.save();

        const token = genToken(user._id);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            },
        })

    } catch (error) {
        console.log("Error in the register route", error)
        res.status(500).json({ message: "Internal server error" })

    }
})


router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Sanitize input
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = genToken(user._id);

        res.status(200).json({
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage
            },
        });

    } catch (error) {
        console.error("Error in login route:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router

