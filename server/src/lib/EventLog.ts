import fs from "fs"
import os from "os"
import path from "path"
import readline from "readline"

// const sessionTimestamp = new Date().toISOString()

export class EventLog {
  dirPath: string

  constructor(dirPath: string) {
    this.dirPath = dirPath
  }

  add(data: Record<string, any>) {
    try {
      const json = JSON.stringify(data)
      const text = json + os.EOL
      fs.appendFileSync(this.filePath, text)
    } catch (err) {
      console.error("EventLog.add:", err)
    }
  }

  // current session's logs
  async get() {
    try {
      const lines = await this.readLines(this.filePath)
      return lines
    } catch (err) {
      console.error("EventLog.get", err)
    }
  }

  // all logs
  async getAll() {
    try {
      const fileNames = fs.readdirSync(this.dirPath)
      const allLines = await Promise.all(
        fileNames.map(fileName => this.readLines(`${this.dirPath}/${fileName}`))
      )
      return allLines.flatMap(lines => lines)
    } catch (err) {
      console.error("EventLog.getAll", err)
    }
  }

  private async readLines(filePath: string) {
    const fileStream = fs.createReadStream(filePath)

    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    })

    let lines = []
    for await (const line of rl) {
      lines.unshift(JSON.parse(line))
    }

    return lines
  }

  private get filePath() {
    return path.join(this.dirPath, `user-events.log`)
    // return path.join(this.dirPath, `user-events-${sessionTimestamp}.log`)
  }
}
