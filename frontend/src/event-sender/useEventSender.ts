import { EventSenderContext } from "./context"
import { useContext } from "react"
import { EventSender } from "./EventSender"

export function useEventSender() {
  // Get userId from where-ever
  const userId = "12345"
  const context = useContext(EventSenderContext)
  return new EventSender({ client: context, userId })
}
