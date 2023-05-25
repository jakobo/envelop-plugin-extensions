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
          c.extensions.set("alternate/ext2", "extval2");
          return "foo";
        },
      },
    },
  });

  const testInstance = createTestkit(
    [
      useExtensions({
        filter(key) {
          return !key.startsWith("alternate/");
        },
      }),
    ],
    schema
  );

  const result = await testInstance.execute(
    `query { foo }`,
    {},
    {
      initialContextValue: true,
    }
  );

  assertSingleExecutionValue(result);
  t.truthy(result.data, "runs a query successfully");
  t.is(result.errors, undefined, "has no errors from graphql");
  t.truthy(result.extensions, "sets extensions");
  t.is(result.extensions?.ext1, "extval1", "extensions are saved");
  t.is(
    result.extensions?.["alternate/ext2"],
    undefined,
    "can filter extensions"
  );
});
