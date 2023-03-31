<h1 align="center">
  <span style="font-size:24px">envelop-plugin-extensions</span><br />
  <sub><i>🔌 Set extensions via your GraphQL Context</i></sub>
</h1>

> A plugin for the [envelop](https://the-guild.dev/graphql/envelop) ecosystem that adds the ability to read, set, and clear [GraphQL extensions](https://spec.graphql.org/June2018/#sec-Response-Format). Works with any plugin in the Envelop ecosystem, including [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server) v3.

# Getting Started

```
# or yarn, or npm
pnpm add envelop-plugin-extensions
```

# Usage

Configure `useExtensions()` like you would any other envelop plugin. For example, in GraphQL Yoga:

```ts
import {
  useExtensions,
  type ExtensionsContext,
} from "envelop-plugin-extensions";
import { createYoga, createSchema } from "graphql-yoga";

// Provide your schema
const yoga = createYoga({
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      type Query {
        greetings: String!
      }
    `,
    resolvers: {
      Query: {
        greetings: (parent, args, context, info) => {
          // set an extension value. context.extensions is Map<string, unknown>
          context.extensions.set("extension key", "extension value");
          return "Hello World!";
        },
      },
    },
  }),
  plugins: [useExtensions()],
});

// Start the server and explore http://localhost:4000/graphql
const server = createServer(yoga);
server.listen(4000, () => {
  console.info("Server is running on http://localhost:4000/graphql");
});
```

And see the `extensions` property carried into the response:

```json
{
  "data": {
    "greetings": "Hello World!"
  },
  "extensions": {
    "extension key": "extension value"
  }
}
```

# License

MIT
