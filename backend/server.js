const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
// Use Environment Port for Cloud, 5000 for Local
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

// --- 1. MONGODB CONNECTION ---
// Your specific connection string with password and Database name 'libraryDB'
const MONGO_URI = "mongodb+srv://visisiva09_db_user:Vishwa123@cluster0.tzjizhv.mongodb.net/libraryDB?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.log("❌ MongoDB Connection Error:", err));

// --- 2. DEFINE SCHEMA ---
const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: String,
    category: String,
    publishedYear: Number,
    // Validation: Prevents negative stock at the database level
    availableCopies: { type: Number, min: [0, 'Stock cannot be negative'] } 
});

const Book = mongoose.model('Book', bookSchema);

// --- 3. API ROUTES ---

// 0. HOME ROUTE (To check if server is running)
app.get('/', (req, res) => {
    res.send("🚀 Library Server is Running!");
});

// 1. READ ALL (With Filters: Category & Year)
app.get('/books', async (req, res) => {
    try {
        const { category, minYear } = req.query;
        let filter = {};

        // Apply filters if they exist in the link
        if (category) filter.category = category;
        if (minYear) filter.publishedYear = { $gt: parseInt(minYear) }; // $gt means Greater Than

        const books = await Book.find(filter);
        res.json(books);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. INSERT 7 SAMPLE BOOKS (Seed)
app.post('/books/seed', async (req, res) => {
    const sampleBooks = [
        { title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Fiction", publishedYear: 1925, availableCopies: 5 },
        { title: "Atomic Habits", author: "James Clear", category: "Self-Help", publishedYear: 2018, availableCopies: 10 },
        { title: "Sapiens", author: "Yuval Noah Harari", category: "History", publishedYear: 2011, availableCopies: 3 },
        { title: "1984", author: "George Orwell", category: "Fiction", publishedYear: 1949, availableCopies: 0 },
        { title: "The Alchemist", author: "Paulo Coelho", category: "Fiction", publishedYear: 1988, availableCopies: 8 },
        { title: "Deep Work", author: "Cal Newport", category: "Productivity", publishedYear: 2016, availableCopies: 4 },
        { title: "Rich Dad Poor Dad", author: "Robert Kiyosaki", category: "Finance", publishedYear: 1997, availableCopies: 0 }
    ];
    try {
        await Book.deleteMany({}); // Optional: Clear old data first
        await Book.insertMany(sampleBooks);
        res.json({ message: "✅ 7 Books Inserted Successfully!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. CREATE SINGLE BOOK
app.post('/books', async (req, res) => {
    try {
        const newBook = new Book(req.body);
        await newBook.save();
        res.status(201).json(newBook);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 4. UPDATE STOCK (Handle + and -)
app.put('/books/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // runValidators: true -> Ensures stock doesn't go below 0
        const updatedBook = await Book.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });

        if (!updatedBook) return res.status(404).json({ error: "❌ Book not found" });
        res.json(updatedBook);
    } catch (err) {
        res.status(400).json({ error: "❌ Error: " + err.message });
    }
});

// 5. DELETE SINGLE BOOK
app.delete('/books/:id', async (req, res) => {
    try {
        await Book.findByIdAndDelete(req.params.id);
        res.json({ message: "Book deleted" });
    } catch (err) {
        res.status(500).json({ error: "Delete failed" });
    }
});

// 6. CLEANUP (Remove books with 0 copies)
app.delete('/books/cleanup/empty', async (req, res) => {
    try {
        const result = await Book.deleteMany({ availableCopies: 0 });
        res.json({ message: `Deleted ${result.deletedCount} out-of-stock books.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// START SERVER
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});