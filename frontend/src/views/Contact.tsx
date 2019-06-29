import React, { useRef, useState, useEffect } from 'react'
import { RouteComponentProps } from '@reach/router';
import { useEventSender } from '../event-sender';
import { useField } from '../hooks/useField';

interface Props extends RouteComponentProps { }

const Contact = (props: Props) => {
  const [submitted, setSubmitted] = useState(false)
  const usernameField = useField('text')
  const emailField = useField('email')
  const contactForm = useRef<HTMLFormElement>(null as any)
  const eventSender = useEventSender()
  const cleanup = useRef<Function>(() => { })

  // cleanup function is only called during unmount, but we need to refresh dependencies
  useEffect(() => {
    cleanup.current = () => {
      if (!submitted) {
        // Only send abort event if form was at least partially filled
        if (usernameField.value !== '' || emailField.value !== '')
          eventSender.abortForm({ view: 'contact', element: contactForm.current })
      }
    }
  }, [usernameField.value, emailField.value, submitted, eventSender])


  useEffect(() => {
    // called when the component unmounts
    return () => {
      cleanup.current()
    }
  }, [])

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    eventSender.submitForm({ view: 'contact', element: contactForm.current })
    if (!submitted) {
      setSubmitted(true)
    }
    usernameField.clear()
    emailField.clear()
    window.alert('Form submitted. Nothing happened!')
  }

  return (
    <form ref={contactForm} id="contact-form" onSubmit={submit}>
      <div>
        <label htmlFor="username">Username: </label>
        <input name="username" {...usernameField.inputProps} />
      </div>
      <div>
        <label htmlFor="email">Email: </label>
        <input name="email" {...emailField.inputProps} />
      </div>
      <button
        type="submit"
        data-testid="submit-contact-form-button">
        Submit
      </button>
    </form>
  )
}

export default Contact
