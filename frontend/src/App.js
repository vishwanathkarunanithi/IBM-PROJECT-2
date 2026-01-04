import React, { useState, useEffect } from 'react';

function App() {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState("");

  // ⚠️ CHANGE THIS URL WHEN DEPLOYING
  // Localhost: 'http://localhost:5000/books'
  // Render:    'https://your-app-name.onrender.com/books'
  const API_URL = 'http://localhost:5000/books';

  // --- FETCH BOOKS (With optional filters) ---
  const fetchBooks = (query = "") => {
    fetch(`${API_URL}${query}`)
      .then(res => res.json())
      .then(data => {
        setBooks(data);
        setError("");
      })
      .catch(err => setError("❌ Error: Cannot connect to Backend. Is it running?"));
  };

  // Load books on first page load
  useEffect(() => {
    fetchBooks();
  }, []);

  // --- BUTTON ACTIONS ---
  
  // 1. Insert 7 Sample Books
  const seedBooks = () => {
    fetch(`${API_URL}/seed`, { method: 'POST' })
      .then(() => fetchBooks())
      .catch(err => console.error(err));
  };

  // 2. Update Stock (+1 or -1)
  const updateStock = (id, currentStock, change) => {
    const newStock = currentStock + change;
    
    // Frontend Validation
    if (newStock < 0) {
      alert("❌ Stock cannot be negative!"); 
      return;
    }

    fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ availableCopies: newStock })
    })
    .then(res => {
        if(!res.ok) throw new Error("Backend Validation Failed");
        return res.json();
    })
    .then(() => fetchBooks()) // Refresh UI
    .catch(err => alert("❌ Update Failed: " + err.message));
  };

  // 3. Delete Single Book
  const deleteBook = (id) => {
    if(window.confirm("Are you sure you want to delete this book?")) {
        fetch(`${API_URL}/${id}`, { method: 'DELETE' })
          .then(() => fetchBooks());
    }
  };

  // 4. Cleanup Empty Stock
  const deleteOutOfStock = () => {
    fetch(`${API_URL}/cleanup/empty`, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        alert(data.message);
        fetchBooks();
      });
  };

  return (
    <div style={{ padding: "40px", fontFamily: "Segoe UI", textAlign: "center", backgroundColor: "#f4f7f6", minHeight: "100vh" }}>
      <h1 style={{ color: "#2c3e50" }}>📚 Library Management System</h1>
      <p style={{color: "#7f8c8d"}}>Connected to: {API_URL}</p>
      
      {/* --- CONTROL PANEL --- */}
      <div style={{ marginBottom: "30px", display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={() => fetchBooks()} style={btnStyle}>🏠 Show All</button>
        <button onClick={() => fetchBooks('?category=Fiction')} style={btnStyle}>📖 Fiction Only</button>
        <button onClick={() => fetchBooks('?minYear=2015')} style={btnStyle}>📅 After 2015</button>
        
        {/* Special Actions */}
        <button onClick={seedBooks} style={{...btnStyle, backgroundColor: "#3498db"}}>📥 Reset DB (7 Books)</button>
        <button onClick={deleteOutOfStock} style={{...btnStyle, backgroundColor: "#e74c3c"}}>🗑️ Remove Empty Stock</button>
      </div>

      {error && <p style={{color: "red", fontWeight: "bold"}}>{error}</p>}

      {/* --- BOOK GRID --- */}
      {books.length > 0 ? (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "20px" }}>
          {books.map((book) => (
            <div key={book._id} style={{ 
              background: "white", padding: "20px", width: "280px", borderRadius: "12px",
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)", textAlign: "left",
              borderTop: `5px solid ${book.availableCopies > 0 ? "#2ecc71" : "#e74c3c"}`
            }}>
              <h3 style={{ margin: "0 0 10px 0", color: "#34495e" }}>{book.title}</h3>
              <p style={{margin:"5px 0", color:"#555"}}>✍️ <strong>Author:</strong> {book.author}</p>
              <p style={{margin:"5px 0", color:"#555"}}>📂 <strong>Cat:</strong> {book.category}</p>
              <p style={{margin:"5px 0", color:"#555"}}>📅 <strong>Year:</strong> {book.publishedYear}</p>
              
              {/* Stock Control Section */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", background: "#ecf0f1", padding: "10px", borderRadius: "8px" }}>
                 <span style={{ fontWeight: "bold", color: book.availableCopies > 0 ? "#27ae60" : "#c0392b" }}>
                   {book.availableCopies > 0 ? `Stock: ${book.availableCopies}` : "Out of Stock"}
                 </span>
                 <div>
                    <button onClick={() => updateStock(book._id, book.availableCopies, 1)} style={smBtn}>+</button>
                    <button onClick={() => updateStock(book._id, book.availableCopies, -1)} style={smBtn}>-</button>
                 </div>
              </div>

              <button onClick={() => deleteBook(book._id)} style={{ width: "100%", marginTop: "10px", padding: "8px", background: "#e74c3c", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>Delete Book</button>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: "50px", color: "#95a5a6" }}>
            <h3>Library is empty...</h3>
            <p>Click "Reset DB" to load the books.</p>
        </div>
      )}
    </div>
  );
}

// Simple Styles
const btnStyle = { padding: "10px 20px", border: "none", borderRadius: "5px", background: "#2c3e50", color: "white", cursor: "pointer", fontSize: "14px", transition: "0.2s" };
const smBtn = { padding: "5px 10px", marginLeft: "5px", cursor: "pointer", border: "1px solid #ccc", background: "white", borderRadius: "3px" };

export default App;