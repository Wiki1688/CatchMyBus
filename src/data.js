/**
 * src/data.js - Live Data Fetchers
 *
 * Calls /api/bus?BusStopCode=XXXXX and /api/rain
 * Adheres strictly to the error contract:
 * - "refused": function answered 4xx/5xx — .status set to upstreamStatus in its JSON
 * - "unreachable": fetch itself threw, or function returned 502
 * - "not_found": function returned 400 for a code that is not five digits
 */

/**
 * getBus(stopCode)
 * Returns: { stopCode, fetchedAt, services: [ { serviceNo, next: [ 4, 11 ] } ] }
 * where next holds 0, 1 or 2 whole minutes and 0 means "Arriving".
 */
export async function getBus(stopCode) {
  let res;
  try {
    res = await fetch(`/api/bus?BusStopCode=${encodeURIComponent(stopCode)}`);
  } catch (err) {
    const error = new Error('No connection to LTA');
    error.code = 'unreachable';
    error.status = 'unreachable';
    throw error;
  }

  // Handle 400 (not 5 digits) -> "not_found"
  if (res.status === 400) {
    const error = new Error('Bus stop code is invalid');
    error.code = 'not_found';
    error.status = 400;
    throw error;
  }

  // Handle 502 -> "unreachable"
  if (res.status === 502) {
    const error = new Error('No connection to LTA');
    error.code = 'unreachable';
    error.status = 'unreachable';
    throw error;
  }

  // Handle non-2xx responses (e.g. 503 missing key, 401, 403, 500) -> "refused"
  if (!res.ok) {
    let upstreamStatus = res.status;
    try {
      const errData = await res.json();
      if (errData && errData.upstreamStatus !== undefined) {
        upstreamStatus = errData.upstreamStatus;
      }
    } catch {
      // response body was not JSON
    }

    if (upstreamStatus === 'unreachable') {
      const error = new Error('No connection to LTA');
      error.code = 'unreachable';
      error.status = 'unreachable';
      throw error;
    }

    const error = new Error(`Unable to retrieve bus arrivals (error ${upstreamStatus})`);
    error.code = 'refused';
    error.status = upstreamStatus;
    throw error;
  }

  // On 2xx success
  const data = await res.json();
  return {
    stopCode: data.stopCode || stopCode,
    fetchedAt: data.fetchedAt || new Date().toISOString(),
    services: Array.isArray(data.services) ? data.services : [],
  };
}

/**
 * getRain()
 * Returns: { validPeriod, updatedAt, areas: [ { area, forecast, rainExpected } ] }
 */
export async function getRain() {
  let res;
  try {
    res = await fetch('/api/rain');
  } catch (err) {
    const error = new Error('No connection to the weather service');
    error.code = 'unreachable';
    error.status = 'unreachable';
    throw error;
  }

  // Handle 502 -> "unreachable"
  if (res.status === 502) {
    const error = new Error('No connection to the weather service');
    error.code = 'unreachable';
    error.status = 'unreachable';
    throw error;
  }

  // Handle non-2xx responses -> "refused"
  if (!res.ok) {
    let upstreamStatus = res.status;
    try {
      const errData = await res.json();
      if (errData && errData.upstreamStatus !== undefined) {
        upstreamStatus = errData.upstreamStatus;
      }
    } catch {
      // response body was not JSON
    }

    if (upstreamStatus === 'unreachable') {
      const error = new Error('No connection to the weather service');
      error.code = 'unreachable';
      error.status = 'unreachable';
      throw error;
    }

    const error = new Error(`Unable to retrieve weather forecast (error ${upstreamStatus})`);
    error.code = 'refused';
    error.status = upstreamStatus;
    throw error;
  }

  // On 2xx success
  const data = await res.json();
  return {
    validPeriod: data.validPeriod || '',
    updatedAt: data.updatedAt || '',
    areas: Array.isArray(data.areas) ? data.areas : [],
  };
}
