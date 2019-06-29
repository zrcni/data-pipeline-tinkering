import io from "socket.io-client"

export class WSClient {
  private socket: SocketIOClient.Socket

  constructor(url: string) {
    this.socket = io(url, { autoConnect: false })
    this.addListeners()
  }

  connect() {
    this.socket.open()
  }

  disconnect() {
    this.socket.close()
  }

  emit(event: string, ...args: any[]) {
    this.socket.emit(event, ...args)
  }

  // Adds a listener for a specific event
  // Returns a function which removes the listener
  on(event: string, fn: Function) {
    this.socket.on(event, fn)
    return () => this.socket.removeEventListener(event, fn)
  }

  private addListeners() {
    this.socket.on("connect", () => {
      console.log("WSClient connected")
    })
    this.socket.on("disconnect", () => {
      console.log("WSClient disconnected")
    })
    this.socket.on("reconnect", () => {
      console.log("WSClient reconnected")
    })
    this.socket.on("error", (err: Error) => {
      console.error("WSClient error:", err)
    })
  }
}
