import assert from "node:assert/strict";

// Responses are consumed per query, not per chained method. The recorded
// filters let tests verify user/team scoping as well as returned values.
export function createDatabase() {
  const responses = [];
  const calls = [];
  const methods = [
    "select",
    "eq",
    "in",
    "order",
    "limit",
    "insert",
    "update",
    "delete",
    "upsert",
    "single",
    "maybeSingle",
  ];
  const db = {
    calls,
    queue(...results) {
      responses.push(...results);
    },
    reset() {
      responses.length = 0;
      calls.length = 0;
    },
    pending() {
      return responses.length;
    },
    rpc(name, args) {
      calls.push({ rpc: name, args });
      const result = responses.shift();
      assert.notEqual(result, undefined, `Unexpected RPC call to ${name}`);
      return Promise.resolve(result);
    },
    from(table) {
      const call = { table, operations: [] };
      calls.push(call);
      const result = responses.shift();
      assert.notEqual(result, undefined, `Unexpected database call to ${table}`);
      const query = { then: (yes, no) => Promise.resolve(result).then(yes, no) };
      for (const method of methods) {
        query[method] = (...args) => {
          call.operations.push([method, ...args]);
          return query;
        };
      }
      return query;
    },
  };
  return db;
}

export const ok = (data) => ({ data, error: null });
export const failure = (message) => ({ data: null, error: { message } });
