import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { WSClient } from './lib/ws-client'
import { EventSenderContext } from './event-sender'

const SERVER_URL = "http://localhost:8080"
const wsClient = new WSClient(SERVER_URL)

function AppWithProviders() {
  useEffect(() => {
    wsClient.connect()
    return () => {
      wsClient.disconnect()
    }
  }, [])

  return (
    <EventSenderContext.Provider value={wsClient}>
      <App />
    </EventSenderContext.Provider>
  )
}

ReactDOM.render(<AppWithProviders />, document.getElementById('root'));
