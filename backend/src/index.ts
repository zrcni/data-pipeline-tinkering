import express from "express"
import { Server as HTTPServer } from "http"
import SocketIOServer, { Socket } from "socket.io"
import { EventLog } from "./EventLog"
import path from "path"
import cors from "cors"
import bodyParser from "body-parser"

const eventLogPath = path.resolve(process.cwd(), "..", "data")
const eventLog = new EventLog(eventLogPath)

const app = express()
app.use(cors())
app.use(bodyParser.json())

const server = new HTTPServer(app)

const sio = SocketIOServer(server)

const PORT = 4000

server.listen(PORT)

server.on("listening", () => {
  console.log(`Express and socket.io listening on port ${PORT}`)
})

app.get("/", (req, res) => {
  res.status(200).send("OK")
})

app.get("/events", async (req, res) => {
  const lines = await eventLog.getAll()
  res.status(200).json(lines)
})

sio.on("connection", socket => {
  addListeners(socket)
})

function addListeners(socket: Socket) {
  socket.on("user-event", event => {
    console.log("Name:", event.name)
    console.log("Data:", event.data)
    eventLog.add(event)
  })
}
