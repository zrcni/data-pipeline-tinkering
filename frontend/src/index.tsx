import React, { useEffect } from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { WSClient } from './lib/ws-client'
import { EventSenderContext } from './event-sender'

const BACKEND_URL = "http://localhost:4000"
const wsClient = new WSClient(BACKEND_URL)

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
