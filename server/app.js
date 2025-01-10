const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const dotenv=require('dotenv');
dotenv.config();
const mongoConnect=require('./db/connect')
const userRoute=require('./routes/userRoute');
const ProductRoute=require('./routes/ProductRoute');
const authRoute=require('./routes/authRoute');
const cartRoute=require('./routes/cartRouter');
const wishlistRout=require('./routes/wishlistRoute');
const reviewsRoute=require('./routes/reviewRoute');
const orderRoute=require('./routes/orderRoute');


// Middleware to handle CORS
app.use(cors({
    origin: "http://localhost:5173"
}));
app.use(express.json({ limit: "5120mb" })); 
app.use(express.urlencoded({ extended: true }));
// Static file middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
//connect db
mongoConnect();
// Test route
app.get('/test', (req, res) => {
    res.status(200).send("Test successful");
});
//routes
app.use(authRoute);
app.use(ProductRoute);
app.use(userRoute);
app.use(cartRoute);
app.use(wishlistRout)
app.use(reviewsRoute);
app.use(orderRoute);

// Example route to handle other routes
app.use((req, res) => {
    res.status(404).send({ message: "Route not found" });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
