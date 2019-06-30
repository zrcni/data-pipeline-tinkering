import { PubSub } from "@google-cloud/pubsub"
import path from "path"

export function createPubSubClient() {
  return new PubSub({
    projectId: process.env.GOOGLE_CLOUD_PROJECT,
    keyFile: path.resolve(process.cwd(), "gcp-creds.json")
  })
}
