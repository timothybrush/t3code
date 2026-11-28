import * as Effect from "effect/Effect";
import * as SqlClient from "effect/sql/SqlClient";

export default Effect.gen(function* () {
  const sql = yield* SqlClient.SqlClient;

  // Calls used to store a peer not answering as the link's last error, which
  // outlived the peer waking up. Listing checks that live now, so those go;
  // a peer's own refusals stay.
  yield* sql`
    UPDATE peer_environment_links SET last_error = NULL
    WHERE last_error LIKE '% did not answer%'
      OR last_error LIKE 'Transport error (%'
      OR last_error LIKE 'Transport: %'
      OR last_error LIKE 'Operation timed out after %'
  `;
});
