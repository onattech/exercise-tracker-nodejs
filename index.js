const express = require("express")
const connectDB = require("./db/connection")
const Log = require("./models/log")
const ObjectId = require("mongodb").ObjectID

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
    console.log("At home") //?
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

app.get("/api/exercise/log", async (req, res) => {
  let { to, from, limit, userId: _id } = req.query

  let query = {
    _id,
    "log.date": { $lte: to ? to : Date.now(), $gte: from ? from : 0 },
  }

  try {
    const rawEx = await Log.findOne(query)

    if (!rawEx) {
      res.send("No such user")
      return
    }

    rawEx.log.sort((a,b)=>{ 
      return new Date(b.date) - new Date(a.date)
      })
    
    res.json(makeResponse(rawEx, from, to, limit))
  } catch (error) {
    console.error(error)
    res.json(error)
  }
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))

function makeResponse(rawEx, from, to, limit) {
  //fix this line
  // console.log(rawEx);

  let obj = {}
  obj._id = rawEx.id
  obj.username = rawEx.username
  from ? (obj.from = new Date(from).toDateString()) : obj.from = new Date(0).toDateString()
  to ? (obj.to = new Date(to).toDateString())  : obj.to = new Date().toDateString()
  limit && (obj.limit = limit)
  obj.logs = []
  let logs = rawEx.log
    .filter((a) => a.date >= new Date(obj.from))
    .filter((a) => a.date <= new Date(obj.to))
  if (limit > logs.length || !limit) limit = logs.length 

  for (let index = 0; index < limit; index++) {
    let exercise = {
      description: logs[index].description,
      duration: logs[index].duration,
      date: logs[index].date.toDateString(),
    }
    obj.logs.push(exercise)
  }
  return obj
}
