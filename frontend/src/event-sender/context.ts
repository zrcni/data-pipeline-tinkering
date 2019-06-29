import { createContext } from "react"
import { EventSenderClient } from "./EventSender"

// The context only has the client, because the actual EventSender
// is created using the hook useEventSender
export const EventSenderContext = createContext<EventSenderClient>(null as any)
