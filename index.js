const connectDB = require('./db/connection')
const express = require("express")

const app = express()

connectDB()

app.use(express.json({ extended: false }))

const PORT = process.env.PORT || 5000

app.listen(PORT, ()=> console.log(`Server running on port ${PORT}`))