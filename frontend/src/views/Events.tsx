import React, { useState, useEffect, Fragment } from 'react'
import { RouteComponentProps } from '@reach/router';

interface Event {
  name: string
  data: { [key: string]: any }
}

interface Props extends RouteComponentProps { }

const FILTERS = {
  BUTTON_CLICK: 'BUTTON_CLICK',
  FORM_SUBMIT: 'FORM_SUBMIT',
  FORM_ABORT: 'FORM_ABORT',
  NAVIGATE: 'NAVIGATE'
}

function filterBy(filter: string) {
  return (event: Event) => {
    switch (filter) {
      case FILTERS.BUTTON_CLICK:
        return new RegExp('.*:.*:button:click').test(event.name)
      case FILTERS.FORM_SUBMIT:
        return new RegExp('.*:.*:form:submit').test(event.name)
      case FILTERS.FORM_ABORT:
        return new RegExp('.*:.*:form:abort').test(event.name)
      case FILTERS.NAVIGATE:
        return new RegExp('.*:.*:.*:click').test(event.name) && !!event.data.navigateTo
      default:
        return true
    }
  }
}

const Events = (props: Props) => {
  const [events, setEvents] = useState<Event[]>([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetch('http://localhost:4000/events', { method: 'GET' })
      .then(response => response.json())
      .then((events: Event[]) => {
        setEvents(events)
      })
      .catch(err => console.error(err))
  }, [])

  return (
    <Fragment>
      <div>
        <h4>Filter</h4>
        <select onChange={e => setFilter(e.target.value)}>
          <option value="">None</option>
          <option value={FILTERS.BUTTON_CLICK}>Button click</option>
          <option value={FILTERS.FORM_SUBMIT}>Form submit</option>
          <option value={FILTERS.FORM_ABORT}>Form abort</option>
          <option value={FILTERS.NAVIGATE}>Navigation</option>
        </select>
      </div>
      <table style={{ width: "100%", fontSize: '18px' }}>
        <thead>
          <tr>
            <th>Type</th>
            <th>Name</th>
            <th>Timestamp</th>
            <th>id</th>
            <th>data-testid</th>
          </tr>
        </thead>
        <tbody>
          {events
            .filter(filterBy(filter))
            .sort((a, b) => new Date(a.data.timestamp) > new Date(b.data.timestamp) ? -1 : 0)
            .map(event => (
              <tr key={event.name + event.data.timestamp}>
                <td>{getEventType(event)}</td>
                <td>{event.name}</td>
                <td>{event.data.timestamp}</td>
                <td>{event.data.elementId || "None"}</td>
                <td>{event.data.dataTestid || "None"}</td>
              </tr>
            ))}
        </tbody>
      </table >
    </Fragment>
  )
}

function getEventType(event: Event) {
  switch (true) {
    case !!event.data.navigateTo:
      return 'Navigation'
    case new RegExp('.*:.*:form:submit').test(event.name):
      return 'Form submit'
    case new RegExp('.*:.*:form:abort').test(event.name):
      return 'Form abort'
    case new RegExp('.*:.*:button:click').test(event.name):
      return 'Button click'
    default:
      return 'Unknown'
  }
}

export default Events
