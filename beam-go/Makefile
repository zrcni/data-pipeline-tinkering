run:
	make build \
	&& PUBSUB_PROJECT_ID=data-processing-245308 \
	GOOGLE_APPLICATION_CREDENTIALS=/home/smappa/code/tinker/frontend-user-events/server/gcp-creds.json \
	./beam
 
build:
	go build -o beam