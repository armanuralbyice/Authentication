const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();
const cookieParser = require('cookie-parser')
const userRouter = require('./router/user')
const errorMiddleware = require('./middleware/errors')
const app = express();

app.use(express.json());
app.use(cookieParser())
const {PORT} = process.env
const {DB} = process.env
mongoose.set('strictQuery', true);
mongoose.connect(DB)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));
app.use('/api/user', userRouter)
app.use(errorMiddleware)
app.listen(PORT, () => console.log(`Listening on port ${PORT} in ${process.env.NODE_ENV} mode`));
