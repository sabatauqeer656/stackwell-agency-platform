// True when the API says "no such thing" (404) or "that is not even a valid id/slug" (400).
// Asking again will not change the answer, so the UI shows "not found" instead of "try again".
export const isMissing = (error) => [400, 404].includes(error?.response?.status);

// Turns any failed request into one predictable shape, so forms never have to dig through Axios internals:
//   { status, code, message, details }
// `details` is the list of field problems the API sends with a 400: [{ field, message }]
export function getApiError(error) {
  const response = error?.response;

  // No response at all: the server is down, or the visitor is offline
  if (!response) {
    return {
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'We could not reach the server. Please check your connection and try again.',
      details: [],
    };
  }

  const body = response.data?.error ?? {};
  return {
    status: response.status,
    code: body.code,
    message: body.message ?? 'Something went wrong on our side. Please try again.',
    details: body.details ?? [],
  };
}

// Used as a TanStack Query `retry` option: never retry a "missing" answer,
// but give unexpected failures (network, 5xx) one more chance.
export const retryUnlessMissing = (failureCount, error) => !isMissing(error) && failureCount < 1;
