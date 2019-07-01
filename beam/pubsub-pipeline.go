package main

import (
	"context"
	"encoding/json"
	"fmt"
	"os"

	"github.com/apache/beam/sdks/go/pkg/beam"
	"github.com/apache/beam/sdks/go/pkg/beam/io/pubsubio"
	"github.com/apache/beam/sdks/go/pkg/beam/log"
	"github.com/apache/beam/sdks/go/pkg/beam/x/beamx"
	"github.com/apache/beam/sdks/go/pkg/beam/x/debug"
)

var (
	topic        = "user-events"
	subscription = "user-events-beam"
	project      = os.Getenv("PUBSUB_PROJECT_ID")
)

// Not actually working, because pubsub IO doesn't work with the direct runner AFAIK?
func runPubsubPipeline() {
	ctx := context.Background()
	log.Infof(ctx, "Running streaming")

	p := beam.NewPipeline()
	s := p.Root()

	messages := pubsubio.Read(s, project, topic, &pubsubio.ReadOptions{Subscription: subscription})
	events := beam.ParDo(s, deserializeEvent, messages)
	eventNames := beam.ParDo(s, toEventName, events)
	debug.Print(s, eventNames)

	if err := beamx.Run(context.Background(), p); err != nil {
		log.Exitf(ctx, "Failed to execute job: %v", err)
	}
}

func deserializeEvent(ctx context.Context, message []byte) Event {
	fmt.Printf("Message: %s", string(message))
	event := Event{}
	err := json.Unmarshal(message, &event)
	if err != nil {
		fmt.Print(err)
		return event
	}
	fmt.Printf("Event: %+v", event)
	return event
}

func toEventName(ctx context.Context, event Event) string {
	return event["eventName"].(string)
}
