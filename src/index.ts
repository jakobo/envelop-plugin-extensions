import { ExecutionResult } from "graphql";
import { isAsyncIterable, Plugin } from "@envelop/core";

/** The extensions object complies with the GraphQL `extensions` specification */
export type Extensions = Map<string, unknown>;

/** The additional context properties exposing the extensions plugin api */
export interface ExtensionsContext {
  extensions: Extensions;
}

// helper to force an object to an array
const asArray = <T>(x: T | T[]): T[] => (Array.isArray(x) ? x : [x]);

/**
 * Adds the ability to set and read from the extensions:{} object via the
 * context. Adds one property to the context `extensions` which is of type
 * `Map<string, unknown>`.
 */
export function useExtensions(): Plugin<ExtensionsContext> {
  return {
    onExecute(c) {
      const data = new Map<string, unknown>();
      c.extendContext({
        extensions: data,
      });

      return {
        async onExecuteDone({ result }) {
          if (data.size === 0) return;

          const attach = (sr: ExecutionResult<unknown, unknown>) => {
            if (!sr.extensions) {
              sr.extensions = {};
            }

            for (const [key, value] of data) {
              if (typeof sr.extensions === "object" && sr.extensions !== null) {
                sr.extensions[key] = value;
              }
            }
          };

          // should handle streaming results, but requires more real-world testing
          // other envelop plugins choose to skip the async iteration
          // https://github.com/dotansimha/graphql-yoga/blob/5fad274e51c6faec65b6a1ee957280a5d562b3ad/packages/plugins/apollo-inline-trace/src/index.ts#LL159C8-L159C8
          if (isAsyncIterable(result)) {
            const itt = result[Symbol.asyncIterator]();
            let next: Awaited<ReturnType<(typeof itt)["next"]>>;

            while ((next = await itt.next())) {
              if (next.done) {
                break;
              }
              attach(next.value);
            }
            return;
          }

          for (const singleResult of asArray(result)) {
            attach(singleResult);
          }
        },
      };
    },
  };
}
