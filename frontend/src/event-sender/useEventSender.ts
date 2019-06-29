import { EventSenderContext } from "./context"
import { useContext } from "react"
import { EventSender } from "./EventSender"

// EventSender sends user events to the backend
// Creates new EventSender on every render.
// Would be more optimal to setup a context provider that uses
// useEffect to create a new EventSender when userId is set.
export function useEventSender() {
  // Get userId from where-ever
  const userId = "12345"
  const context = useContext(EventSenderContext)
  return new EventSender({ client: context, userId })
}
