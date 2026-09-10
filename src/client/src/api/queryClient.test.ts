import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "./errorClasses.ts";
import { createQueryClient } from "./queryClient.ts";

const showAlert = vi.fn();
const createClient = () => createQueryClient({ showAlert, translate: key => key, retryQueries: false });

/** Runs a mutation that fails, so the client's error reporting can be observed. */
const runFailingMutation = async (error: unknown) => {
  const client = createClient();
  const mutation = client.getMutationCache().build(client, { mutationFn: () => Promise.reject(error), retry: false });

  await expect(mutation.execute(undefined)).rejects.toBe(error);
};

describe("createQueryClient", () => {
  beforeEach(() => {
    showAlert.mockClear();
  });

  it("reports an unexpected mutation failure to the user", async () => {
    await runFailingMutation(new Error("boom"));

    expect(showAlert).toHaveBeenCalledWith("errorMutationNotSuccessfull", "error");
  });

  it("leaves an ApiError to the caller that knows the context", async () => {
    await runFailingMutation(new ApiError("Not found", 404));

    expect(showAlert).not.toHaveBeenCalled();
  });

  it("stays quiet when the user cancels a transfer", async () => {
    await runFailingMutation(new DOMException("The user aborted a request.", "AbortError"));

    expect(showAlert).not.toHaveBeenCalled();
  });
});
