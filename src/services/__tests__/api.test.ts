import { AxiosError, AxiosHeaders } from "axios";
import { ApiError, toApiError } from "@/services/api";

const axiosError = (partial: Partial<AxiosError>): AxiosError => {
  const error = new AxiosError(
    partial.message ?? "Request failed",
    partial.code,
    { headers: new AxiosHeaders() },
    null,
    partial.response as AxiosError["response"],
  );
  return error;
};

const response = (status: number, data: unknown) =>
  ({
    status,
    statusText: "",
    data,
    headers: {},
    config: { headers: new AxiosHeaders() },
  }) as AxiosError["response"];

describe("toApiError", () => {
  it("maps a missing response to a network error", () => {
    const result = toApiError(axiosError({ message: "Network Error" }));

    expect(result).toBeInstanceOf(ApiError);
    expect(result.kind).toBe("network");
    expect(result.isRetryable).toBe(true);
  });

  it("maps ECONNABORTED to a timeout", () => {
    expect(toApiError(axiosError({ code: "ECONNABORTED" })).kind).toBe("timeout");
  });

  it("maps status codes to kinds", () => {
    const cases: [number, string][] = [
      [401, "unauthorized"],
      [403, "forbidden"],
      [404, "notFound"],
      [422, "validation"],
      [500, "server"],
    ];

    for (const [status, kind] of cases) {
      expect(toApiError(axiosError({ response: response(status, {}) })).kind).toBe(
        kind,
      );
    }
  });

  it("extracts a human message from common payload shapes", () => {
    expect(
      toApiError(axiosError({ response: response(400, { message: "Bad email" }) }))
        .message,
    ).toBe("Bad email");

    expect(
      toApiError(axiosError({ response: response(400, { detail: "Nope" }) }))
        .message,
    ).toBe("Nope");
  });

  it("normalises field errors for forms", () => {
    const result = toApiError(
      axiosError({
        response: response(422, {
          errors: { email: ["is taken"], name: "is required" },
        }),
      }),
    );

    expect(result.fieldErrors).toEqual({
      email: ["is taken"],
      name: ["is required"],
    });
  });

  it("marks only transient failures retryable", () => {
    expect(toApiError(axiosError({ response: response(500, {}) })).isRetryable).toBe(
      true,
    );
    expect(toApiError(axiosError({ response: response(404, {}) })).isRetryable).toBe(
      false,
    );
  });

  it("passes an existing ApiError straight through", () => {
    const original = new ApiError({ message: "already wrapped", kind: "server" });
    expect(toApiError(original)).toBe(original);
  });
});
