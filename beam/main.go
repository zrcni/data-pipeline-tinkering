package main

import (
	"flag"
	"fmt"
	"time"

	"github.com/apache/beam/sdks/go/pkg/beam"
)

type Event struct {
	Name string                 `json:"name"`
	Data map[string]interface{} `json:"data"`
}

func main() {
	flag.Parse()
	beam.Init()

	for {
		go func() {
			errChan := make(chan error, 1)

			go runLogFilePipeline(errChan)

			err := <-errChan
			if err != nil {
				fmt.Println("runLogFilePipeline", err)
			}
		}()
		time.Sleep(time.Minute * 5)
	}

	// runPubsubPipeline()
	// runTestPipeline()
}
