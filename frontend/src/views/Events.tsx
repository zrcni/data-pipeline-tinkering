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

const Events = (props: Props) => {
  const [events, setEvents] = useState<Event[]>([])
  const [filter, setFilter] = useState('')

  useEffect(() => {
    fetch('http://localhost:8080/api/events?limit=50', { method: 'GET' })
      .then(response => response.json())
      .then((events: Event[]) => {
        setEvents(events)
      })
      .catch(err => console.error(err))
  }, [])

  const filteredEvents = events.filter(filterBy(filter))

  return (
    <Fragment>
      <div style={{ marginBottom: 10 }}>
        <label htmlFor="select-filter">Filter </label>
        <select name="select-filter" onChange={e => setFilter(e.target.value)}>
          <option value="">None</option>
          <option value={FILTERS.BUTTON_CLICK}>Button click</option>
          <option value={FILTERS.FORM_SUBMIT}>Form submit</option>
          <option value={FILTERS.FORM_ABORT}>Form abort</option>
          <option value={FILTERS.NAVIGATE}>Navigation</option>
        </select>
      </div>
      <p>Count: {filteredEvents.length}</p>
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
          {filteredEvents
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

function filterBy(filter: string) {
  return (event: Event) => {
    const rNavigate = new RegExp('.*:.*:.*:click').test(event.name) && !!event.data.navigateTo
    const rFormAbort = new RegExp('.*:.*:form:abort').test(event.name)
    const rFormSubmit = new RegExp('.*:.*:form:submit').test(event.name)

    switch (filter) {
      case FILTERS.FORM_SUBMIT:
        return rFormSubmit
      case FILTERS.FORM_ABORT:
        return rFormAbort
      case FILTERS.NAVIGATE:
        return rNavigate
      case FILTERS.BUTTON_CLICK:
        return !rNavigate
          && !rFormAbort
          && !rFormSubmit
          && new RegExp('.*:.*:button:click').test(event.name)
      default:
        return true
    }
  }
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
