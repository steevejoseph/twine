export const toQueryString = (params: any) => {
  const esc = encodeURIComponent;
  const query = Object.keys(params)
    .map((k) => esc(k) + '=' + esc(params[k]))
    .join('&');
  return `?${query}`;
};
