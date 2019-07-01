import express from "express"
import { Server as HTTPServer } from "http"
import SocketIOServer, { Socket } from "socket.io"
import { EventLog } from "./lib/EventLog"
import cors from "cors"
import bodyParser from "body-parser"

const eventLogPath = "/data"
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

// ?limit=<number>
app.get("/api/events", async (req, res) => {
  const limit = req.query.limit
  const lines = await eventLog.get()
  const finalLines = limit ? lines.slice(0, Number(limit)) : lines
  res.status(200).json(finalLines)
})

sio.on("connection", socket => {
  addListeners(socket)
})

function addListeners(socket: Socket) {
  socket.on("user-event", event => {
    const enrichedEvent = enrichEvent(event, socket)
    console.log("Event:", enrichedEvent)

    eventLog.add(event)
  })
}

function enrichEvent(event, socket: Socket) {
  const ip =
    socket.handshake["x-real-ip"] || socket.handshake.headers["x-forwarded-for"]
  return {
    ...event,
    ip
  }
}
