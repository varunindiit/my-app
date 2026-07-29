import { createApi } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosRequestConfig } from "axios";
import api, { ApiError, toApiError } from "./api";

/**
 * RTK Query, backed by the app's axios instance.
 *
 * Using `fetchBaseQuery` would mean two HTTP stacks with two sets of rules:
 * the axios one (auth header, refresh-token retry, `ApiError` normalisation)
 * and fetch's. Routing RTK Query through the same instance means every
 * endpoint defined here inherits all of it for free.
 *
 * Server state — anything fetched from an API — belongs here. Redux slices are
 * for *client* state (session, preferences, UI). Mixing the two is the most
 * common way Redux apps end up with hand-rolled loading flags and stale caches.
 */
export type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
  headers?: AxiosRequestConfig["headers"];
};

const axiosBaseQuery =
  (): BaseQueryFn<AxiosBaseQueryArgs | string, unknown, ApiError> =>
  async (args, apiContext) => {
    const config: AxiosBaseQueryArgs =
      typeof args === "string" ? { url: args } : args;

    try {
      const result = await api.request({
        url: config.url,
        method: config.method ?? "GET",
        data: config.data,
        params: config.params,
        headers: config.headers,
        // Lets RTK Query cancel in-flight requests when a component unmounts.
        signal: apiContext.signal,
      });
      return { data: result.data };
    } catch (error) {
      return { error: toApiError(error) };
    }
  };

/**
 * Base API. Feature endpoints are added with `apiSlice.injectEndpoints(...)`
 * from their own files, so this module never becomes a dumping ground.
 *
 *   // src/features/profile/profileApi.ts
 *   export const profileApi = apiSlice.injectEndpoints({
 *     endpoints: (build) => ({
 *       getProfile: build.query<UserProfile, void>({
 *         query: () => ({ url: "/me" }),
 *         providesTags: ["Profile"],
 *       }),
 *     }),
 *   });
 *   export const { useGetProfileQuery } = profileApi;
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  // Declare cache tags up front so `providesTags` / `invalidatesTags` typecheck.
  tagTypes: ["Profile", "Session"],
  endpoints: () => ({}),
});
