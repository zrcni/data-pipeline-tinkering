import { PubSub } from "@google-cloud/pubsub"

export class DataPipeline {
  pubsub: PubSub

  constructor(pubsub: PubSub) {
    this.pubsub = pubsub
  }

  async push(data: Record<string, any>) {
    const topicName = "user-events"
    const topic = this.pubsub.topic(topicName)
    const published = await topic.publishJSON(data)
    console.log('published?:', published)
  }
}
