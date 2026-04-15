import { Client } from "@elastic/elasticsearch";

export const esClient = new Client({
  node: process.env.ELASTICSEARCH_NODE || "http://localhost:9200",
  // No special headers or compatibility flags needed for v8
});