import React from 'react';
import { Router, Link } from "@reach/router";
import './App.css';
import Home from './views/Home';
import Contact from './views/Contact';
import Events from './views/Events';
import { useEventSender } from './event-sender';

function getViewNameFromPath(path: string) {
  const view = path.replace('/', '')
  if (view === '') {
    return 'home'
  }
  return view
}

const App = () => {
  const eventSender = useEventSender()

  function navigate(path: string) {
    return (e: React.MouseEvent<HTMLAnchorElement>) => {
      if (window.location.pathname !== path) {
        const navigateFrom = getViewNameFromPath(window.location.pathname)
        const navigateTo = getViewNameFromPath(path)
        eventSender.click({ view: navigateFrom, navigateTo, element: e.currentTarget })
      }
    }
  }

  return (
    <div className="App App-header">
      <header id="header">
        <Link
          to="/"
          className="header-link"
          data-testid="link-to-home"
          onClick={navigate('/')}
        >
          Home
          </Link>
        <Link
          to="/contact"
          className="header-link"
          data-testid="link-to-contact"
          onClick={navigate('/contact')}
        >
          Contact
          </Link>
        <Link
          to="/events"
          className="header-link"
          data-testid="link-to-events"
          onClick={navigate('/events')}
        >
          Events
          </Link>
      </header>
      <div id="content">
        <Router>
          <Home path="/" />
          <Contact path="/contact" />
          <Events path="/events" />
        </Router>
      </div>
    </div>
  );
}

export default App;
