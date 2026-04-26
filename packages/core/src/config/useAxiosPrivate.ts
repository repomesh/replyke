import { useEffect } from "react";
import type { AxiosInstance } from "axios";
import { axiosPrivate } from "./axios";
import { useAuth } from "../hooks/auth";

// Module-level mutex: prevents concurrent token rotations from racing
let refreshPromise: Promise<string | undefined> | null = null;

const useAxiosPrivate = (): AxiosInstance => {
  const { accessToken, requestNewAccessToken } = useAuth();

  useEffect(() => {
    const requestIntercept = axiosPrivate.interceptors.request.use(
      (config) => {
        if (config.headers["Authorization"]) return config;
        config.headers["Authorization"] = `Bearer ${accessToken}`;
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseIntercept = axiosPrivate.interceptors.response.use(
      (response) => response,
      async (error) => {
        const prevRequest = error?.config;
        if (error?.response?.status === 403 && !prevRequest?.sent) {
          prevRequest.sent = true;

          // Use mutex to prevent concurrent rotation races
          if (!refreshPromise) {
            refreshPromise = requestNewAccessToken?.()?.finally(() => {
              refreshPromise = null;
            }) ?? Promise.resolve(undefined);
          }

          const newAccessToken = await refreshPromise;

          if (!newAccessToken) {
            return Promise.reject(error);
          }

          prevRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return axiosPrivate(prevRequest);
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosPrivate.interceptors.request.eject(requestIntercept);
      axiosPrivate.interceptors.response.eject(responseIntercept);
    };
  }, [accessToken, requestNewAccessToken]);

  return axiosPrivate;
};

export default useAxiosPrivate;
