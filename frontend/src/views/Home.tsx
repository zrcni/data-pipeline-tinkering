import React from 'react'
import { RouteComponentProps } from '@reach/router'
import { useEventSender } from '../event-sender'

interface Props extends RouteComponentProps { }

const Main = (props: Props) => {
  const eventSender = useEventSender()

  function doThing(e: React.MouseEvent<HTMLButtonElement>) {
    eventSender.click({ view: 'home', element: e.currentTarget })
    window.alert('You did a thing!!')
  }

  return (
    <div>
      <button data-testid="do-a-thing-button" onClick={doThing}>Do a thing!</button>
    </div>
  )
}

export default Main
