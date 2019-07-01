package main

import (
	"bufio"
	"context"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"regexp"

	"github.com/apache/beam/sdks/go/pkg/beam"
	"github.com/apache/beam/sdks/go/pkg/beam/log"
	"github.com/apache/beam/sdks/go/pkg/beam/transforms/filter"
	"github.com/apache/beam/sdks/go/pkg/beam/transforms/stats"
	"github.com/apache/beam/sdks/go/pkg/beam/x/beamx"
	"github.com/apache/beam/sdks/go/pkg/beam/x/debug"
)

var previousFile = InitPreviousFile()

func runLogFilePipeline() error {
	ctx := context.Background()

	data, err := readLatestEvents()
	if err != nil {
		return err
	}

	if len(data) == 0 {
		return fmt.Errorf("No events found. Skipping pipeline.")
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
		userID := e["userId"].(string)
		return userID, e
	}, events)
	eventsByUserID := beam.GroupByKey(s, keyedUserIDs)
	debug.Printf(s, "UserID: %v", eventsByUserID)

	if err := beamx.Run(ctx, p); err != nil {
		log.Exitf(ctx, "Failed to execute job: %v", err)
	}
	return nil
}

func printEventByViewFn(view string) func(ctx context.Context, event Event) {
	return func(ctx context.Context, event Event) {
		log.Infof(ctx, "View %s: %s", view, event["eventName"].(string))
	}
}

func filterEventByView(view string) func(Event) bool {
	return func(e Event) bool {
		pattern := fmt.Sprintf(".*:%s:.*:.*", view)
		match, _ := regexp.MatchString(pattern, e["eventName"].(string))
		return match
	}
}

func extractFn(ctx context.Context, e Event, emit func(string)) {
	view := e["view"].(string)
	emit(view)
}

func readLatestEvents() ([]Event, error) {
	// execPath, _ := os.Executable()
	// dir, _ := filepath.Split(execPath)
	files, err := ioutil.ReadDir("/home/smappa/code/tinker/data-pipeline-tinkering/data/raw")
	if err != nil {
		return []Event{}, nil
	}

	if len(files) == 0 {
		return []Event{}, fmt.Errorf("No files found")
	}

	lastFile := files[len(files)-1]
	if previousFile.Name != lastFile.Name() {
		previousFile.ResetLineNumber()
		previousFile.Name = lastFile.Name()
	}
	file, err := os.Open(filepath.Join("/home/smappa/code/tinker/data-pipeline-tinkering/data/raw", lastFile.Name()))
	if err != nil {
		return []Event{}, err
	}

	events := []Event{}

	currentLineNumber := 0
	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		currentLineNumber++
		// Skip until the previously read line number
		if currentLineNumber <= previousFile.LineNumber {
			continue
		}
		previousFile.LineNumber = currentLineNumber

		event := Event{}
		err := json.Unmarshal([]byte(scanner.Text()), &event)
		if err != nil {
			return []Event{}, err
		}
		events = append(events, event)
	}

	previousFile.Persist()
	return events, nil
}

type PreviousFile struct {
	LineNumber int    `json:"lineNumber"`
	Name       string `json:"name"`
}

func (pf PreviousFile) ResetName() {
	pf.Name = ""
}

func (pf PreviousFile) ResetLineNumber() {
	pf.LineNumber = 0
}

func (pf PreviousFile) Reset() {
	pf.ResetName()
	pf.ResetLineNumber()
}

func (pf PreviousFile) Persist() {
	data, err := json.Marshal(pf)
	if err != nil {
		fmt.Println(err)
		return
	}
	err = ioutil.WriteFile("./previous-file.json", data, os.ModePerm)
	if err != nil {
		fmt.Println(err)
	}
}

func InitPreviousFile() PreviousFile {
	pf := PreviousFile{0, ""}
	data, err := ioutil.ReadFile("./previous-file.json")
	if err != nil {
		fmt.Println(err)
	} else {
		if len(data) > 0 {
			err = json.Unmarshal(data, &pf)
			if err != nil {
				fmt.Println(err)
			}
		}
	}
	return pf
}
