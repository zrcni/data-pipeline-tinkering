package main

import (
	"flag"
	"fmt"
	"time"

	"github.com/apache/beam/sdks/go/pkg/beam"
)

type Event map[string]interface{}

func main() {
	flag.Parse()
	beam.Init()

	for {
		go func() {
			err := runLogFilePipeline()
			if err != nil {
				fmt.Println("runLogFilePipeline", err)
			}
		}()
		time.Sleep(time.Minute * 1)
	}

	// runPubsubPipeline()
	// runTestPipeline()
}
