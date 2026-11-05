// True when the API says "no such thing" (404) or "that is not even a valid id/slug" (400).
// Asking again will not change the answer, so the UI shows "not found" instead of "try again".
export const isMissing = (error) => [400, 404].includes(error?.response?.status);

// Used as a TanStack Query `retry` option: never retry a "missing" answer,
// but give unexpected failures (network, 5xx) one more chance.
export const retryUnlessMissing = (failureCount, error) => !isMissing(error) && failureCount < 1;
