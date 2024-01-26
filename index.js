const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
const PORT = 3000;

// Middleware to parse JSON in request body
app.use(bodyParser.json());

// Read products data from JSON file
const productsData = JSON.parse(fs.readFileSync("products.json", "utf8"));

// API to get all products
app.get("/products", (req, res) => {
  res.json(productsData);
});

// API to get a specific product by ID
app.get("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const product = productsData.find((p) => p.id === productId);

  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// API to create a new product
app.post("/products", (req, res) => {
  const newProduct = req.body;
  productsData.push(newProduct);

  fs.writeFileSync(
    "products.json",
    JSON.stringify(productsData, null, 2),
    "utf8"
  );

  res.status(201).json(newProduct);
});

// API to update a product by ID
app.put("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const updatedProduct = req.body;

  // Find the index of the product with the given ID
  const index = productsData.findIndex((p) => p.id === productId);

  if (index !== -1) {
    // Update the product
    productsData[index] = { ...productsData[index], ...updatedProduct };

    fs.writeFileSync(
      "products.json",
      JSON.stringify(productsData, null, 2),
      "utf8"
    );

    res.json(productsData[index]);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// API to delete a product by ID
app.delete("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);

  // Filter out the product with the given ID
  const updatedProducts = productsData.filter((p) => p.id !== productId);

  fs.writeFileSync(
    "products.json",
    JSON.stringify(updatedProducts, null, 2),
    "utf8"
  );

  res.json({ message: "Product deleted successfully" });
});

// API to search, sort, and filter products
app.get("/search", (req, res) => {
  const { q, sortBy, filterBy } = req.query;

  let filteredProducts = productsData;

  if (q) {
    // Search by name or description
    const searchQuery = q.toLowerCase();
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery) ||
        p.description.toLowerCase().includes(searchQuery)
    );
  }

  if (sortBy) {
    // Sort by price
    filteredProducts.sort((a, b) => a.price - b.price);
  }

  if (filterBy) {
    // Filter by product_type
    filteredProducts = filteredProducts.filter(
      (p) => p.product_type.toLowerCase() === filterBy.toLowerCase()
    );
  }

  res.json(filteredProducts);
});

// API to update product quantity
app.patch("/products/:id/quantity", (req, res) => {
  const productId = parseInt(req.params.id);
  const { quantity } = req.body;

  const index = productsData.findIndex((p) => p.id === productId);

  if (index !== -1) {
    productsData[index].quantity = quantity;

    fs.writeFileSync(
      "products.json",
      JSON.stringify(productsData, null, 2),
      "utf8"
    );

    res.json(productsData[index]);
  } else {
    res.status(404).json({ message: "Product not found" });
  }
});

// API to get out-of-stock products
app.get("/out-of-stock", (req, res) => {
  const outOfStockProducts = productsData.filter((p) => p.quantity < 5);
  res.json(outOfStockProducts);
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
