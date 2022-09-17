const processRequest = async (method, url, data, headers) => {
  let req = request.build(method, url, data, headers ?? {});
  return fetch(req).then((rsp) => {
    if (!rsp.ok) {
      let errorEvent = new CustomEvent("fetcherror", {
        detail: {
          method: req.method,
          url: req.url,
          body: data,
          status: rsp.status,
          statusText: rsp.statusText,
        },
      });
      window.dispatchEvent(errorEvent);
      return new Error({
        status: rsp.status,
        statusText: rsp.statusText
      });
    }
    try {
      return rsp.json();
    } catch (exc) {
      console.error(`fetch ${req.url} error，返回值不是JSON`, exc);
    }
  });
};
const request = {
  BASE_URL: "",
  createHeaders(headers) {
    return new Headers({
      "Content-Type": "application/json",
      ...(typeof headers == "function" ? headers() : headers)
    });
  },

  get baseUrl() {
    return window.REQUEST_BASE_URL ?? this.BASE_URL ?? window.location.href;
  },
  build(method, url, data, headers) {
    if (method == "GET" || method == "DELETE") {
      url = this.buildURL(url, data);
      data = null;
    }
    let requestUrl = url;
    if (!/^https?:\/\//.test(url)) {
      requestUrl = new URL(url, this.baseUrl).href
    }
    return new Request(requestUrl, {
      method,
      headers: this.createHeaders(headers),
      body: data != null ? JSON.stringify(data) : null,
    });
  },
  buildURL(url, params) {
    if (params) {
      let q = Object.entries(params)
        .filter((kv) => kv[1] != null)
        .map((kv) => {
          let key = kv[0];
          let value = kv[1];
          if (value instanceof Array) {
            //json-server
            //return value.map(v => `${key}=${encodeURIComponent(v)}`).join('&')
            //测试中，如果查询值中有逗号不知道会有问题吗？
            return `${key}=${value
              .map((v) => encodeURIComponent(v))
              .join(",")}`;
          } else if (typeof value == "object") {
            return Object.keys(value)
              .map((k) => `${key}.${k}=${encodeURIComponent(value[k])}`)
              .join("&");
          }
          return `${key}=${encodeURIComponent(value)}`;
        })
        .join("&");
      if (url.includes("?")) {
        url += "&" + q;
      } else {
        url += "?" + q;
      }
    }
    return url;
  },

  async get(url, params, headers) {
    return processRequest("GET", url, params, headers);
  },
  async post(url, data, headers) {
    return processRequest("POST", url, data, headers);
  },
  async put(url, data, headers) {
    return processRequest("PUT", url, data, headers);
  },
  async patch(url, data, headers) {
    return processRequest("PATCH", url, data, headers);
  },
  async delete(url, data, headers) {
    return processRequest("DELETE", url, data, headers);
  },
};

export default request;
