import { from } from 'rxjs';

import parseResponseBody from './parse-response-body';

export default function doRequest(url, params) {
  const promise = fetch(url, params)
    .then(response => Promise.all([response.ok, parseResponseBody(response)]))
    .then(([ok, body]) => (ok ? body : Promise.reject(body)));

  return from(promise);
}
