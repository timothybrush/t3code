import { RUN_STOPPED_BY_PROVIDER_REASON, RUN_STOPPED_BY_USER_REASON } from "@t3tools/contracts";
import { mFallback } from "gt-i18n";
import type { MFunctionType } from "gt-i18n/types";
import { describe, expect, it } from "vite-plus/test";

import { runStopReasonLabel } from "./contractLabels.ts";

describe("runStopReasonLabel", () => {
  const german = ((message, options) => `de: ${mFallback(message, options)}`) as MFunctionType;

  it("translates the reasons the server writes when no one gave one", () => {
    expect(runStopReasonLabel(RUN_STOPPED_BY_USER_REASON, german)).toBe("de: Stopped by user");
    expect(runStopReasonLabel(RUN_STOPPED_BY_PROVIDER_REASON, german)).toBe(
      "de: Stopped by the provider",
    );
  });

  it("shows an agent's own reason as written", () => {
    expect(runStopReasonLabel("Stopped by an agent: tests pass", german)).toBe(
      "Stopped by an agent: tests pass",
    );
  });
});
