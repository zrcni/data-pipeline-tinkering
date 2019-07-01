Trying to figure out how to implement user events on the frontend. Like, which events make sense, what's the event's structure and how to handle sending them to the server. I also wanted to try out Apache Beam.

I've had this topic on my mind, but I had just to try some stuff out after seeing this paper mentioned in a talk I watched: [The Unified Logging Infrastructure for Data Analytics at Twitter](http://vldb.org/pvldb/vol5/p1771_georgelee_vldb2012.pdf).

Basically:

1. User clicks a button, submits a form, navigates to another view, as generic examples
2. Send event to the server via web socket
3. Receive event on the server and enrich it with more data from session/headers (ip address, flags/version (if canary))
4. Forward event to the next step in the data pipeline

The implemented pipeline is just reading from a log file every minute and processing the data with Apache Beam. Really the point of this is to try things out so how the data gets there and when it's processed isn't important in this context.

I did however try to get stream processing to work with Google PubSub, but from what I read PubSub doesn't currently work with the direct Beam runner in the Go Beam SDK. I would've had to set up a distributed data processing system like Apache Spark or Flink to make it work.

### ideally:

- server listens for events from the frontend
- send events to pubsub
- consume the events with Beam
- aggregate into stats
- save to database

![dataflow](data-pipeline.png)

### Google Pub/Sub + Dataflow + BigQuery would probably be a great option that's easy to manage

# TODO: save processed data LOL
