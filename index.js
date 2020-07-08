const express = require("express")
const connectDB = require("./db/connection")
const Log = require("./models/log")

// Initialize the app
const app = express()

// Connect database
connectDB()

// Middlewares
app.use(express.json({ extended: false }))
app.use(express.urlencoded({ extended: false })) // Body parser makes req.body. available

// Static Routes
app.use(express.static("public"))

// add-user Route
app.post("/api/exercise/new-user", async (req, res) => {
  try {
    let userRegistered = await Log.findOne({ username: req.body.username })
    if (!userRegistered) {
      const username = new Log({
        username: req.body.username,
      })
      await username.save()
      res.send(username)
    } else {
      res.status(400).send("Username already taken")
    }
  } catch (err) {
    console.error(err)
    res.status(500).json("Server error")
  }
})

// exercise/add Route
app.post("/api/exercise/add", async (req, res) => {
  const id = req.body.id
  const description = req.body.description
  const duration = req.body.duration
  const date = req.body.date

  try {
    let userRegistered = await Log.findOne({ _id: req.body.id })
    if (!userRegistered) {
      res.send("no such user")
      return
    }

    Log.findOneAndUpdate(
      { _id: id },
      { $push: { log: { description, duration, date } } },
      { new: true },
      (er, re) => {
        if (er) {
          console.log("something went wrong")
        }
      }
    )

    let result = await Log.findOne({ _id: id })
    console.log(result)
    console.log(date)
    let x = new Date(date)
    console.log(x)
   

    res.json({
      _id: id,
      username: result.username,
      date: new Date(date),
      duration: Number(duration),
      description,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json("Server error")
  }
})
// app.get("/:id", async (req, res) => {

app.get("/api/exercise/log", async (req, res) => {
  let params = req.query

  if (!params.userId) {
    res.send("Must enter a userId.")
    return
  }
  try {
    // const info = await Log.findOne({ _id: params.userId},{'log._id':0,log:{$elemMatch:{duration:{$gte:5}}}})
    const info = await Log.find({ _id: params.userId , 'log.duration': 15})
    if (!info) {
      res.send("No such user")
      return
    }
    
    res.json(info)
  } catch (error) {
    console.error(error);
    res.json(error)
  }


 

  

})


const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
