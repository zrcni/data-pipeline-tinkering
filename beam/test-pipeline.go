package main

import (
	"context"

	"github.com/apache/beam/sdks/go/pkg/beam"
	"github.com/apache/beam/sdks/go/pkg/beam/log"
	"github.com/apache/beam/sdks/go/pkg/beam/transforms/filter"
	"github.com/apache/beam/sdks/go/pkg/beam/transforms/stats"
	"github.com/apache/beam/sdks/go/pkg/beam/x/beamx"
	"github.com/apache/beam/sdks/go/pkg/beam/x/debug"
)

func runTestPipeline() {
	ctx := context.Background()

	data := []Event{
		{Name: "frontend:home:button:click", Data: map[string]interface{}{"view": "home", "navigateTo": "contact", "dataTestid": "link-to-contact", "userId": "12345", "timestamp": "2019-06-29T20:52:35.169Z", "ip": "192.168.64.1"}},
		{Name: "frontend:contact:button:click", Data: map[string]interface{}{"view": "contact", "navigateTo": "home", "dataTestid": "link-to-home", "userId": "12345", "timestamp": "2019-06-29T20:52:36.305Z", "ip": "192.168.64.1"}},
		{Name: "frontend:home:button:click", Data: map[string]interface{}{"view": "home", "navigateTo": "contact", "dataTestid": "link-to-contact", "userId": "12345", "timestamp": "2019-06-29T20:52:36.776Z", "ip": "192.168.64.1"}},
	}

	log.Info(ctx, "Running")

	p := beam.NewPipeline()
	s := p.Root()
	events := beam.CreateList(s, data)

	// Filter events by "home" view
	homeView := filter.Include(s, events, filterEventByView("home"))
	// Just prints the individual events
	beam.ParDo0(s, printEventByViewFn("home"), homeView)

	// Filter events by "contact" view
	contactView := filter.Include(s, events, filterEventByView("contact"))
	// Just prints the individual events
	beam.ParDo0(s, printEventByViewFn("contact"), contactView)

	// Prints the count of each view in events
	views := beam.ParDo(s, extractFn, events)
	viewsCount := stats.Count(s, views)
	debug.Printf(s, "Views count: %s", viewsCount)

	// Groups events by userId
	keyedUserIDs := beam.ParDo(s, func(e Event) (string, Event) {
		userID := e.Data["userId"].(string)
		return userID, e
	}, events)
	eventsByUserID := beam.GroupByKey(s, keyedUserIDs)
	debug.Printf(s, "UserID: %v", eventsByUserID)

	if err := beamx.Run(ctx, p); err != nil {
		log.Exitf(ctx, "Failed to execute job: %v", err)
	}
}

// func printEventByViewFn(view string) func(ctx context.Context, event Event) {
// 	return func(ctx context.Context, event Event) {
// 		log.Infof(ctx, "View %s: %s", view, event.Name)
// 	}
// }

// func filterEventByView(view string) func(Event) bool {
// 	return func(e Event) bool {
// 		pattern := fmt.Sprintf(".*:%s:.*:.*", view)
// 		match, _ := regexp.MatchString(pattern, e.Name)
// 		return match
// 	}
// }

// func extractFn(ctx context.Context, e Event, emit func(string)) {
// 	view := e.Data["view"].(string)
// 	emit(view)
// }
