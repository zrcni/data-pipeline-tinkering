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

    const name = `frontend:${args.view}:form:abort`
    this.emitUserEvent(name, extraData)
  }

  submitForm(args: BaseArgs & ElementArgs) {
    const { element, ...data } = args
    const elementData = this.getElementData(element)

    const extraData = {
      ...data,
      ...elementData
    }

    const name = `frontend:${args.view}:form:submit`
    this.emitUserEvent(name, extraData)
  }

  click(args: BaseArgs & ElementArgs) {
    const { element, ...data } = args
    const elementData = this.getElementData(args.element)

    const extraData = {
      ...data,
      ...elementData
    }

    const name = `frontend:${args.view}:button:click`
    this.emitUserEvent(name, extraData)
  }

  private emitUserEvent(name: string, extraData: Record<string, any>) {
    const event = {
      name,
      data: {
        ...extraData,
        userId: this.userId,
        timestamp: new Date().toISOString()
      }
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

interface RequiredEventData {
  userId: string
  timestamp: string
}

interface BaseEvent {
  name: string
  data: RequiredEventData
}

export interface EventSenderClient {
  emit: (baseEvent: string, eventData: BaseEvent) => void
}

interface Args {
  client: EventSenderClient
  userId: string
}
