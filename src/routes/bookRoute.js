import express from "express";
import cloudinary from "../lib/cloudinary.js";
import Book from "../models/Book.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

// Create a new book
router.post("/", protectRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;


        // Validate required fields
        if (!image || !title || !caption || rating === undefined) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const numericRating = Number(rating);
        if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ message: "Rating must be a number between 1 and 5" });
        }

        // Upload image to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(image);
        const { secure_url, public_id } = uploadResponse;

        // Save book to database
        const newBook = new Book({
            title,
            caption,
            rating: numericRating,
            image: secure_url,
            publicId: public_id,
            user: req.user._id,
        });

        await newBook.save();

        res.status(201).json({
            success: true,
            message: "Book created successfully",
            newBook,
        });
    } catch (error) {
        console.error("Error creating book:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get all books with pagination
router.get("/", protectRoute, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const skip = (page - 1) * limit;

        const books = await Book.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("user", "username profileImage");

        const totalBooks = await Book.countDocuments();

        res.status(200).json({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        });
    } catch (error) {
        console.error("Error fetching books:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete a book
router.delete("/:id", protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: "Book not found" });
        }

        // Ensure the requesting user owns the book
        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Delete image from Cloudinary using stored publicId
        if (book.publicId) {
            try {
                await cloudinary.uploader.destroy(book.publicId);
            } catch (deleteError) {
                console.error("Error deleting image from Cloudinary:", deleteError);
            }
        }

        await book.deleteOne();

        res.status(200).json({ message: "Book deleted successfully" });
    } catch (error) {
        console.error("Error deleting book:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Get books created by the logged-in user
router.get("/user", protectRoute, async (req, res) => {
    try {
        const books = await Book.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(books);
    } catch (error) {
        console.error("Error fetching user's books:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default router;