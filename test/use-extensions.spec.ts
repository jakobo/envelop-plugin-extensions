import test from "ava";
import { createTestkit, assertSingleExecutionValue } from "@envelop/testing";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { useExtensions } from "../src/index.js";

test("useExtensions", async (t) => {
  const schema = makeExecutableSchema({
    typeDefs: `type Query { foo: String }`,
    resolvers: {
      Query: {
        foo(p, a, c: { extensions: Map<string, string> }, i) {
          c.extensions.set("ext1", "extval1");
          return "foo";
        },
      },
    },
  });

  const testInstance = createTestkit([useExtensions()], schema);

  const result = await testInstance.execute(
    `query { foo }`,
    {},
    {
      initialContextValue: true,
    }
  );

  assertSingleExecutionValue(result);
  t.is(result.errors, undefined);
  t.truthy(result.data);
  t.truthy(result.extensions);
  t.is(result.extensions?.ext1, "extval1");
});
