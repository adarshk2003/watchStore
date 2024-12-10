const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const mongoConnect = require('./db/connect');
const userRoutes = require('./routes/userRoute');
const authRoutes = require('./routes/authRoute');
const produtRoutes = require('./routes/ProductRoute');
const sellerRoutes = require('./routes/sellerRoute')

app.use(cors({
    origin: 'http://localhost:5173'
}));

app.get('/test', (req, res) => {
    res.status(200).send("Test successful");
});

mongoConnect()

app.use(express.json({ limit: "1000mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(userRoutes);
app.use(authRoutes);
app.use(produtRoutes);
app.use(sellerRoutes);

app.use(express.static("../client"));
app.use('/upload', express.static(path.join(__dirname, 'upload')));






app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});