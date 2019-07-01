// EventSender formats events and sends them to the server
export class EventSender {
  private userId: string
  private client: EventSenderClient

  constructor(args: Args) {
    this.client = args.client
    this.userId = args.userId
  }

  abortForm(args: BaseArgs & ElementArgs) {
    const { element, ...data } = args
    const elementData = this.getElementData(element)

    const extraData = {
      ...data,
      ...elementData
    }

    const eventName = `frontend:${args.view}:form:abort`
    this.emitUserEvent(eventName, extraData)
  }

  submitForm(args: BaseArgs & ElementArgs) {
    const { element, ...data } = args
    const elementData = this.getElementData(element)

    const extraData = {
      ...data,
      ...elementData
    }

    const eventName = `frontend:${args.view}:form:submit`
    this.emitUserEvent(eventName, extraData)
  }

  click(args: BaseArgs & ElementArgs) {
    const { element, ...data } = args
    const elementData = this.getElementData(args.element)

    const extraData = {
      ...data,
      ...elementData
    }

    const eventName = `frontend:${args.view}:button:click`
    this.emitUserEvent(eventName, extraData)
  }

  private emitUserEvent(eventName: string, extraData: Record<string, any>) {
    const event = {
      eventName,
      ...extraData,
      userId: this.userId,
      eventInitiator: 'frontend:user',
      timestamp: new Date().toISOString()
    }
    this.client.emit("user-event", event)
  }

  private getElementData(element: HTMLElement) {
    const elementId = element.id ? element.id : undefined
    const dataTestid = element.dataset.testid
      ? element.dataset.testid
      : undefined
    return {
      elementId,
      dataTestid
    }
  }
}

interface BaseArgs {
  [key: string]: any
}

interface ElementArgs {
  view: string
  element: HTMLElement
}

export interface BaseEvent {
  eventName: string
  userId: string
  // From client or server?
  // Triggered by user or app?
  // (client/server):(user/app)
  eventInitiator: string
  details?: string
  timestamp: string
}

export interface EventSenderClient {
  emit: (baseEvent: string, eventData: BaseEvent) => void
}

interface Args {
  client: EventSenderClient
  userId: string
}
