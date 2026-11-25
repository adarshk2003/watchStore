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
const defaultOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://watchstore-frontent.onrender.com"
];

const configuredOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map((u) => u.trim()).filter(Boolean)
  : [];

const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests or any matched origin
    if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    // In production, also allow Render and Vercel subdomains if needed
    if (/\.onrender\.com$/.test(origin) || /\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true, 
}));

app.use(express.json({ limit: "16mb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
// Static file middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check and test routes
app.get('/health', (req, res) => {
    res.status(200).json({
        status: "ok",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

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

app.use((error, req, res, next) => {
    if (error.type === 'entity.too.large') {
        return res.status(413).json({ message: 'Request body is too large.' });
    }
    return next(error);
});

// Example route to handle other routes
app.use((req, res) => {
    res.status(404).send({ message: "Route not found" });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    await mongoConnect();
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

startServer().catch((error) => {
    console.error('Server startup failed:', error);
    process.exitCode = 1;
});
