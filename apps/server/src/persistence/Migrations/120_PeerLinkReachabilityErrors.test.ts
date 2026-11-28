import { assert, it } from "@effect/vitest";
import * as NodeSqliteClient from "@t3tools/shared/nodeSqliteClient";
import * as Effect from "effect/Effect";
import * as SqlClient from "effect/sql/SqlClient";

import { runMigrations } from "../Migrations.ts";

const layer = it.layer(NodeSqliteClient.layer({ filename: ":memory:" }));

layer("120_PeerLinkReachabilityErrors", (it) => {
  it.effect("forgets a stored peer not answering and keeps the peer's refusals", () =>
    Effect.gen(function* () {
      const sql = yield* SqlClient.SqlClient;
      yield* runMigrations({ toMigrationInclusive: 119 });

      const errors = {
        asleep: "Box did not answer at http://127.0.0.1:47812.",
        relay: "Box did not answer.",
        transport: "Transport error (POST http://127.0.0.1:47812/mcp)",
        timeout: "Operation timed out after '5s'",
        revoked:
          "The linked environment no longer accepts this link. It may have been revoked there; link it again.",
        refused: "No such thread.",
      };
      for (const [id, error] of Object.entries(errors)) {
        yield* sql`
          INSERT INTO peer_environment_links (
            environment_id, secret_name, label, urls_json, access, linked_at, expires_at, last_error
          ) VALUES (
            ${id}, ${`secret-${id}`}, 'Box', '[]', 'auto',
            '2026-11-01T00:00:00.000Z', '2026-12-01T00:00:00.000Z', ${error}
          )
        `;
      }

      yield* runMigrations({ toMigrationInclusive: 120 });

      const rows = yield* sql<{ environment_id: string; last_error: string | null }>`
        SELECT environment_id, last_error FROM peer_environment_links ORDER BY environment_id
      `;
      assert.deepStrictEqual(
        Object.fromEntries(rows.map((row) => [row.environment_id, row.last_error])),
        {
          asleep: null,
          refused: errors.refused,
          relay: null,
          revoked: errors.revoked,
          timeout: null,
          transport: null,
        },
      );
    }),
  );
});
