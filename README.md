Trying to figure out how to implement user events on the frontend. Like, which events make sense, what's the event's structure and how to handle sending them to the server.

I've this topic on my mind, but I had just to try some stuff out after seeing this paper mentioned in a talk I watched: [The Unified Logging Infrastructure for Data Analytics at Twitter](http://vldb.org/pvldb/vol5/p1771_georgelee_vldb2012.pdf).

Basically:

1. User clicks a button, submits a form, navigates to another view etc.
2. Send event to the server via web socket
3. Receive event on the server and enrich it with request/socket specific data (ip address at the very least)
4. Forward event to the next step in the data pipeline if there's one
    - for now, just saving it to a file


## thoughts and prayers

- socket event listener sends data to pubsub
- consume the events with Beam
- aggregate into stats
- save to database (influx?)

key-value
- userid
    - form submit
        - element id
        - element data-testid
        - count
    - navigation
        - from
        - to
        - count
