var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// node_modules/weakmap-polyfill/weakmap-polyfill.js
var require_weakmap_polyfill = __commonJS({
  "node_modules/weakmap-polyfill/weakmap-polyfill.js"(exports) {
    (function(self2) {
      "use strict";
      if (self2.WeakMap) {
        return;
      }
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var hasDefine = Object.defineProperty && function() {
        try {
          return Object.defineProperty({}, "x", { value: 1 }).x === 1;
        } catch (e) {
        }
      }();
      var defineProperty = function(object, name, value) {
        if (hasDefine) {
          Object.defineProperty(object, name, {
            configurable: true,
            writable: true,
            value
          });
        } else {
          object[name] = value;
        }
      };
      self2.WeakMap = function() {
        function WeakMap2() {
          if (this === void 0) {
            throw new TypeError("Constructor WeakMap requires 'new'");
          }
          defineProperty(this, "_id", genId("_WeakMap"));
          if (arguments.length > 0) {
            throw new TypeError("WeakMap iterable is not supported");
          }
        }
        defineProperty(WeakMap2.prototype, "delete", function(key) {
          checkInstance(this, "delete");
          if (!isObject(key)) {
            return false;
          }
          var entry = key[this._id];
          if (entry && entry[0] === key) {
            delete key[this._id];
            return true;
          }
          return false;
        });
        defineProperty(WeakMap2.prototype, "get", function(key) {
          checkInstance(this, "get");
          if (!isObject(key)) {
            return void 0;
          }
          var entry = key[this._id];
          if (entry && entry[0] === key) {
            return entry[1];
          }
          return void 0;
        });
        defineProperty(WeakMap2.prototype, "has", function(key) {
          checkInstance(this, "has");
          if (!isObject(key)) {
            return false;
          }
          var entry = key[this._id];
          if (entry && entry[0] === key) {
            return true;
          }
          return false;
        });
        defineProperty(WeakMap2.prototype, "set", function(key, value) {
          checkInstance(this, "set");
          if (!isObject(key)) {
            throw new TypeError("Invalid value used as weak map key");
          }
          var entry = key[this._id];
          if (entry && entry[0] === key) {
            entry[1] = value;
            return this;
          }
          defineProperty(key, this._id, [key, value]);
          return this;
        });
        function checkInstance(x, methodName) {
          if (!isObject(x) || !hasOwnProperty.call(x, "_id")) {
            throw new TypeError(methodName + " method called on incompatible receiver " + typeof x);
          }
        }
        function genId(prefix) {
          return prefix + "_" + rand() + "." + rand();
        }
        function rand() {
          return Math.random().toString().substring(2);
        }
        defineProperty(WeakMap2, "_polyfill", true);
        return WeakMap2;
      }();
      function isObject(x) {
        return Object(x) === x;
      }
    })(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : exports);
  }
});

// node_modules/path-to-regexp/index.js
var require_path_to_regexp = __commonJS({
  "node_modules/path-to-regexp/index.js"(exports, module) {
    module.exports = pathToRegexp;
    module.exports.match = match;
    module.exports.regexpToFunction = regexpToFunction;
    module.exports.parse = parse;
    module.exports.compile = compile;
    module.exports.tokensToFunction = tokensToFunction;
    module.exports.tokensToRegExp = tokensToRegExp;
    var DEFAULT_DELIMITER = "/";
    var PATH_REGEXP = new RegExp([
      "(\\\\.)",
      "(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?"
    ].join("|"), "g");
    function parse(str, options) {
      var tokens = [];
      var key = 0;
      var index = 0;
      var path = "";
      var defaultDelimiter = options && options.delimiter || DEFAULT_DELIMITER;
      var whitelist = options && options.whitelist || void 0;
      var pathEscaped = false;
      var res;
      while ((res = PATH_REGEXP.exec(str)) !== null) {
        var m = res[0];
        var escaped = res[1];
        var offset = res.index;
        path += str.slice(index, offset);
        index = offset + m.length;
        if (escaped) {
          path += escaped[1];
          pathEscaped = true;
          continue;
        }
        var prev = "";
        var name = res[2];
        var capture = res[3];
        var group = res[4];
        var modifier = res[5];
        if (!pathEscaped && path.length) {
          var k = path.length - 1;
          var c = path[k];
          var matches = whitelist ? whitelist.indexOf(c) > -1 : true;
          if (matches) {
            prev = c;
            path = path.slice(0, k);
          }
        }
        if (path) {
          tokens.push(path);
          path = "";
          pathEscaped = false;
        }
        var repeat = modifier === "+" || modifier === "*";
        var optional = modifier === "?" || modifier === "*";
        var pattern = capture || group;
        var delimiter = prev || defaultDelimiter;
        tokens.push({
          name: name || key++,
          prefix: prev,
          delimiter,
          optional,
          repeat,
          pattern: pattern ? escapeGroup(pattern) : "[^" + escapeString(delimiter === defaultDelimiter ? delimiter : delimiter + defaultDelimiter) + "]+?"
        });
      }
      if (path || index < str.length) {
        tokens.push(path + str.substr(index));
      }
      return tokens;
    }
    function compile(str, options) {
      return tokensToFunction(parse(str, options), options);
    }
    function match(str, options) {
      var keys = [];
      var re = pathToRegexp(str, keys, options);
      return regexpToFunction(re, keys);
    }
    function regexpToFunction(re, keys) {
      return function(pathname, options) {
        var m = re.exec(pathname);
        if (!m)
          return false;
        var path = m[0];
        var index = m.index;
        var params = {};
        var decode = options && options.decode || decodeURIComponent;
        for (var i = 1; i < m.length; i++) {
          if (m[i] === void 0)
            continue;
          var key = keys[i - 1];
          if (key.repeat) {
            params[key.name] = m[i].split(key.delimiter).map(function(value) {
              return decode(value, key);
            });
          } else {
            params[key.name] = decode(m[i], key);
          }
        }
        return { path, index, params };
      };
    }
    function tokensToFunction(tokens, options) {
      var matches = new Array(tokens.length);
      for (var i = 0; i < tokens.length; i++) {
        if (typeof tokens[i] === "object") {
          matches[i] = new RegExp("^(?:" + tokens[i].pattern + ")$", flags(options));
        }
      }
      return function(data, options2) {
        var path = "";
        var encode = options2 && options2.encode || encodeURIComponent;
        var validate = options2 ? options2.validate !== false : true;
        for (var i2 = 0; i2 < tokens.length; i2++) {
          var token = tokens[i2];
          if (typeof token === "string") {
            path += token;
            continue;
          }
          var value = data ? data[token.name] : void 0;
          var segment;
          if (Array.isArray(value)) {
            if (!token.repeat) {
              throw new TypeError('Expected "' + token.name + '" to not repeat, but got array');
            }
            if (value.length === 0) {
              if (token.optional)
                continue;
              throw new TypeError('Expected "' + token.name + '" to not be empty');
            }
            for (var j = 0; j < value.length; j++) {
              segment = encode(value[j], token);
              if (validate && !matches[i2].test(segment)) {
                throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '"');
              }
              path += (j === 0 ? token.prefix : token.delimiter) + segment;
            }
            continue;
          }
          if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
            segment = encode(String(value), token);
            if (validate && !matches[i2].test(segment)) {
              throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but got "' + segment + '"');
            }
            path += token.prefix + segment;
            continue;
          }
          if (token.optional)
            continue;
          throw new TypeError('Expected "' + token.name + '" to be ' + (token.repeat ? "an array" : "a string"));
        }
        return path;
      };
    }
    function escapeString(str) {
      return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
    }
    function escapeGroup(group) {
      return group.replace(/([=!:$/()])/g, "\\$1");
    }
    function flags(options) {
      return options && options.sensitive ? "" : "i";
    }
    function regexpToRegexp(path, keys) {
      if (!keys)
        return path;
      var groups = path.source.match(/\((?!\?)/g);
      if (groups) {
        for (var i = 0; i < groups.length; i++) {
          keys.push({
            name: i,
            prefix: null,
            delimiter: null,
            optional: false,
            repeat: false,
            pattern: null
          });
        }
      }
      return path;
    }
    function arrayToRegexp(path, keys, options) {
      var parts = [];
      for (var i = 0; i < path.length; i++) {
        parts.push(pathToRegexp(path[i], keys, options).source);
      }
      return new RegExp("(?:" + parts.join("|") + ")", flags(options));
    }
    function stringToRegexp(path, keys, options) {
      return tokensToRegExp(parse(path, options), keys, options);
    }
    function tokensToRegExp(tokens, keys, options) {
      options = options || {};
      var strict = options.strict;
      var start = options.start !== false;
      var end = options.end !== false;
      var delimiter = options.delimiter || DEFAULT_DELIMITER;
      var endsWith = [].concat(options.endsWith || []).map(escapeString).concat("$").join("|");
      var route2 = start ? "^" : "";
      for (var i = 0; i < tokens.length; i++) {
        var token = tokens[i];
        if (typeof token === "string") {
          route2 += escapeString(token);
        } else {
          var capture = token.repeat ? "(?:" + token.pattern + ")(?:" + escapeString(token.delimiter) + "(?:" + token.pattern + "))*" : token.pattern;
          if (keys)
            keys.push(token);
          if (token.optional) {
            if (!token.prefix) {
              route2 += "(" + capture + ")?";
            } else {
              route2 += "(?:" + escapeString(token.prefix) + "(" + capture + "))?";
            }
          } else {
            route2 += escapeString(token.prefix) + "(" + capture + ")";
          }
        }
      }
      if (end) {
        if (!strict)
          route2 += "(?:" + escapeString(delimiter) + ")?";
        route2 += endsWith === "$" ? "$" : "(?=" + endsWith + ")";
      } else {
        var endToken = tokens[tokens.length - 1];
        var isEndDelimited = typeof endToken === "string" ? endToken[endToken.length - 1] === delimiter : endToken === void 0;
        if (!strict)
          route2 += "(?:" + escapeString(delimiter) + "(?=" + endsWith + "))?";
        if (!isEndDelimited)
          route2 += "(?=" + escapeString(delimiter) + "|" + endsWith + ")";
      }
      return new RegExp(route2, flags(options));
    }
    function pathToRegexp(path, keys, options) {
      if (path instanceof RegExp) {
        return regexpToRegexp(path, keys);
      }
      if (Array.isArray(path)) {
        return arrayToRegexp(path, keys, options);
      }
      return stringToRegexp(path, keys, options);
    }
  }
});

// node_modules/omi/src/options.js
function getGlobal() {
  if (typeof global !== "object" || !global || global.Math !== Math || global.Array !== Array) {
    return self || window || global || function() {
      return this;
    }();
  }
  return global;
}
var options_default = {
  store: null,
  root: getGlobal(),
  mapping: {}
};

// node_modules/omi/src/util.js
(function() {
  if (window.Reflect === void 0 || window.customElements === void 0 || window.customElements.hasOwnProperty("polyfillWrapFlushCallback")) {
    return;
  }
  const BuiltInHTMLElement = HTMLElement;
  window.HTMLElement = function HTMLElement2() {
    return Reflect.construct(BuiltInHTMLElement, [], this.constructor);
  };
  HTMLElement.prototype = BuiltInHTMLElement.prototype;
  HTMLElement.prototype.constructor = HTMLElement;
  Object.setPrototypeOf(HTMLElement, BuiltInHTMLElement);
})();
function cssToDom(css) {
  const node = document.createElement("style");
  node.textContent = css;
  return node;
}
function camelCase(str) {
  return str.replace(/-(\w)/g, ($2, $1) => {
    return $1.toUpperCase();
  });
}
function Fragment(props) {
  return props.children;
}
function extend(obj, props) {
  for (let i in props)
    obj[i] = props[i];
  return obj;
}
function applyRef(ref, value) {
  if (ref != null) {
    if (typeof ref == "function")
      ref(value);
    else
      ref.current = value;
  }
}
var defer = typeof Promise == "function" ? Promise.resolve().then.bind(Promise.resolve()) : setTimeout;
function isArray(obj) {
  return Object.prototype.toString.call(obj) === "[object Array]";
}
function pathToArr(path) {
  if (typeof path !== "string" || !path)
    return [];
  return path.replace(/]/g, "").replace(/\[/g, ".").split(".");
}
var hyphenateRE = /\B([A-Z])/g;
function hyphenate(str) {
  return str.replace(hyphenateRE, "-$1").toLowerCase();
}
function capitalize(name) {
  return name.replace(/\-(\w)/g, function(all, letter) {
    return letter.toUpperCase();
  }).replace(/^\S/, (s) => s.toUpperCase());
}
function getValByPath2(path, current) {
  const arr = pathToArr(path);
  arr.forEach((prop) => {
    current = current[prop];
  });
  return current;
}

// node_modules/omi/src/h.js
var stack = [];
function h(nodeName, attributes) {
  let children = [], lastSimple, child, simple, i;
  for (i = arguments.length; i-- > 2; ) {
    stack.push(arguments[i]);
  }
  if (attributes && attributes.children != null) {
    if (!stack.length)
      stack.push(attributes.children);
    delete attributes.children;
  }
  while (stack.length) {
    if ((child = stack.pop()) && child.pop !== void 0) {
      for (i = child.length; i--; )
        stack.push(child[i]);
    } else {
      if (typeof child === "boolean")
        child = null;
      if (simple = typeof nodeName !== "function") {
        if (child == null)
          child = "";
        else if (typeof child === "number")
          child = String(child);
        else if (typeof child !== "string")
          simple = false;
      }
      if (simple && lastSimple) {
        children[children.length - 1] += child;
      } else if (children.length === 0) {
        children = [child];
      } else {
        children.push(child);
      }
      lastSimple = simple;
    }
  }
  if (nodeName === Fragment) {
    return children;
  }
  const p = {
    nodeName,
    children,
    attributes: attributes == null ? void 0 : attributes,
    key: attributes == null ? void 0 : attributes.key
  };
  if (options_default.vnode !== void 0)
    options_default.vnode(p);
  return p;
}

// node_modules/omi/src/constants.js
var ATTR_KEY = "prevProps";
var IS_NON_DIMENSIONAL = /acit|ex(?:s|g|n|p|$)|rph|ows|mnc|ntw|ine[ch]|zoo|^ord/i;

// node_modules/omi/src/vdom/index.js
function isSameNodeType(node, vnode, hydrating2) {
  if (typeof vnode === "string" || typeof vnode === "number") {
    return node.splitText !== void 0;
  }
  if (typeof vnode.nodeName === "string") {
    return !node._componentConstructor && isNamedNode(node, vnode.nodeName);
  } else if (typeof vnode.nodeName === "function") {
    return options_default.mapping[node.nodeName.toLowerCase()] === vnode.nodeName;
  }
  return hydrating2 || node._componentConstructor === vnode.nodeName;
}
function isNamedNode(node, nodeName) {
  return node.normalizedNodeName === nodeName || node.nodeName.toLowerCase() === nodeName.toLowerCase();
}

// node_modules/omi/src/extend.js
var extension = {};
function extend2(name, handler2) {
  extension["o-" + name] = handler2;
}
function set(origin, path, value) {
  const arr = pathToArr(path);
  let current = origin;
  for (let i = 0, len = arr.length; i < len; i++) {
    if (i === len - 1) {
      current[arr[i]] = value;
    } else {
      current = current[arr[i]];
    }
  }
}
function get(origin, path) {
  const arr = pathToArr(path);
  let current = origin;
  for (let i = 0, len = arr.length; i < len; i++) {
    current = current[arr[i]];
  }
  return current;
}
function eventProxy(e) {
  return this._listeners[e.type](e);
}
function bind(el, type, handler2) {
  el._listeners = el._listeners || {};
  el._listeners[type] = handler2;
  el.addEventListener(type, eventProxy);
}
function unbind(el, type) {
  el.removeEventListener(type, eventProxy);
}

// node_modules/omi/src/dom/index.js
function createNode(nodeName, isSvg, options) {
  let node = isSvg ? document.createElementNS("http://www.w3.org/2000/svg", nodeName) : document.createElement(nodeName, options);
  node.normalizedNodeName = nodeName;
  return node;
}
function removeNode(node) {
  let parentNode = node.parentNode;
  if (parentNode)
    parentNode.removeChild(node);
}
function setAccessor(node, name, old, value, isSvg, component) {
  if (name === "className")
    name = "class";
  if (name[0] == "o" && name[1] == "-") {
    if (extension[name]) {
      extension[name](node, value, component);
    }
  } else if (name === "key") {
  } else if (name === "ref") {
    applyRef(old, null);
    applyRef(value, node);
  } else if (name === "class" && !isSvg) {
    node.className = value || "";
  } else if (name === "style") {
    if (!value || typeof value === "string" || typeof old === "string") {
      node.style.cssText = value || "";
    }
    if (value && typeof value === "object") {
      if (typeof old !== "string") {
        for (let i in old)
          if (!(i in value))
            node.style[i] = "";
      }
      for (let i in value) {
        node.style[i] = typeof value[i] === "number" && IS_NON_DIMENSIONAL.test(i) === false ? value[i] + "px" : value[i];
      }
    }
  } else if (name === "unsafeHTML") {
    if (value)
      node.innerHTML = value || "";
  } else if (name === "dangerouslySetInnerHTML") {
    if (value)
      node.innerHTML = value.__html || "";
  } else if (name[0] == "o" && name[1] == "n") {
    bindEvent(node, name, value, old);
  } else if (node.nodeName === "INPUT" && name === "value") {
    node[name] = value == null ? "" : value;
  } else if (name !== "list" && name !== "type" && name !== "css" && !isSvg && name in node && value !== "") {
    try {
      node[name] = value == null ? "" : value;
    } catch (e) {
    }
    if ((value == null || value === false) && name != "spellcheck")
      node.pureRemoveAttribute ? node.pureRemoveAttribute(name) : node.removeAttribute(name);
  } else {
    let ns = isSvg && name !== (name = name.replace(/^xlink:?/, ""));
    if (value == null || value === false) {
      if (ns)
        node.removeAttributeNS("http://www.w3.org/1999/xlink", name.toLowerCase());
      else
        node.pureRemoveAttribute ? node.pureRemoveAttribute(name) : node.removeAttribute(name);
    } else if (typeof value !== "function") {
      if (ns) {
        node.setAttributeNS("http://www.w3.org/1999/xlink", name.toLowerCase(), value);
      } else {
        node.pureSetAttribute ? node.pureSetAttribute(name, value) : node.setAttribute(name, value);
      }
    }
  }
}
function eventProxy2(e) {
  return this._listeners[e.type](options_default.event && options_default.event(e) || e);
}
function bindEvent(node, name, value, old) {
  let useCapture = name !== (name = name.replace(/Capture$/, ""));
  let nameLower = name.toLowerCase();
  name = (nameLower in node ? nameLower : name).slice(2);
  if (value) {
    if (!old) {
      node.addEventListener(name, eventProxy2, useCapture);
    }
  } else {
    node.removeEventListener(name, eventProxy2, useCapture);
  }
  ;
  (node._listeners || (node._listeners = {}))[name] = value;
}

// node_modules/omi/src/vdom/diff.js
var diffLevel = 0;
var isSvgMode = false;
var hydrating = false;
var purgeVNode = (vnode, args) => {
  if (vnode === null || vnode === void 0 || typeof vnode !== "function" && typeof vnode.nodeName !== "function")
    return vnode;
  const vnodeName = vnode.nodeName;
  if (typeof vnodeName === "function") {
    for (let key in options_default.mapping) {
      if (options_default.mapping[key] === vnodeName) {
        vnode.nodeName = key;
        return vnode;
      }
    }
  }
  args.vnode = vnode;
  args.update = (updateSelf) => {
    return diff(args.dom, args.vnode, args.dom && args.dom.parentNode, args.component, updateSelf);
  };
  if (typeof vnodeName === "function") {
    const { children, attributes } = vnode;
    args.children = children;
    vnode = vnodeName(attributes, args);
  } else {
    vnode = vnode(args);
  }
  if (vnode instanceof Array) {
    vnode = {
      nodeName: "output",
      children: vnode
    };
  }
  if (vnode === null || vnode === void 0 || !vnode.hasOwnProperty("nodeName")) {
    vnode = {
      nodeName: "output",
      children: [vnode]
    };
  }
  vnode.setDom = (dom) => {
    if (dom) {
      args.dom = dom;
      Promise.resolve().then(() => {
        dom.dispatchEvent(new CustomEvent("updated", {
          detail: args,
          cancelable: true,
          bubbles: true
        }));
      });
      if (!dom.update)
        dom.update = args.update;
    }
  };
  return vnode;
};
function diff(dom, vnode, parent, component, updateSelf) {
  if (!dom && !vnode)
    return;
  let ret;
  if (!diffLevel++) {
    isSvgMode = parent != null && parent.ownerSVGElement !== void 0;
    hydrating = dom != null && !(ATTR_KEY in dom);
  }
  vnode = purgeVNode(vnode, { component });
  if (vnode && vnode.nodeName === Fragment) {
    vnode = vnode.children;
  }
  if (isArray(vnode)) {
    vnode = vnode.map((child) => purgeVNode(child, { component }));
    if (parent) {
      innerDiffNode(parent, vnode, hydrating, component, updateSelf);
    } else {
      ret = [];
      vnode.forEach((item, index) => {
        let ele = idiff(index === 0 ? dom : null, item, component, updateSelf);
        ret.push(ele);
      });
    }
  } else {
    if (isArray(dom)) {
      dom.forEach((one, index) => {
        if (index === 0) {
          ret = idiff(one, vnode, component, updateSelf);
        } else {
          recollectNodeTree(one, false);
        }
      });
    } else {
      ret = idiff(dom, vnode, component, updateSelf);
    }
    if (parent && ret.parentNode !== parent)
      parent.appendChild(ret);
  }
  if (!--diffLevel) {
    hydrating = false;
  }
  return ret;
}
function idiff(dom, vnode, component, updateSelf) {
  if (dom && vnode && dom.props) {
    dom.props.children = vnode.children;
  }
  let out = dom, prevSvgMode = isSvgMode;
  if (vnode == null || typeof vnode === "boolean")
    vnode = "";
  if (typeof vnode === "string" || typeof vnode === "number") {
    if (dom && dom.splitText !== void 0 && dom.parentNode && (!dom._component || component)) {
      if (dom.nodeValue != vnode) {
        dom.nodeValue = vnode;
      }
    } else {
      out = document.createTextNode(vnode);
      if (dom) {
        if (dom.parentNode)
          dom.parentNode.replaceChild(out, dom);
        recollectNodeTree(dom, true);
      }
    }
    out[ATTR_KEY] = true;
    vnode.setDom && vnode.setDom(out);
    return out;
  }
  let vnodeName = vnode.nodeName;
  isSvgMode = vnodeName === "svg" ? true : vnodeName === "foreignObject" ? false : isSvgMode;
  vnodeName = String(vnodeName);
  if (!dom || !isNamedNode(dom, vnodeName)) {
    out = createNode(vnodeName, isSvgMode, vnode.attributes && vnode.attributes.is && { is: vnode.attributes.is });
    if (dom) {
      while (dom.firstChild)
        out.appendChild(dom.firstChild);
      if (dom.parentNode)
        dom.parentNode.replaceChild(out, dom);
      recollectNodeTree(dom, true);
    }
  }
  let fc = out.firstChild, props = out[ATTR_KEY], vchildren = vnode.children;
  vchildren = vnode.children.map((child) => purgeVNode(child, { component }));
  if (props == null) {
    props = out[ATTR_KEY] = {};
    for (let a = out.attributes, i = a.length; i--; )
      props[a[i].name] = a[i].value;
  }
  if (!hydrating && vchildren && vchildren.length === 1 && typeof vchildren[0] === "string" && fc != null && fc.splitText !== void 0 && fc.nextSibling == null) {
    if (fc.nodeValue != vchildren[0]) {
      fc.nodeValue = vchildren[0];
    }
  } else if (vchildren && vchildren.length || fc != null) {
    if (!(out.constructor.is == "WeElement" && out.constructor.noSlot)) {
      innerDiffNode(out, vchildren, hydrating || props.dangerouslySetInnerHTML != null, component, updateSelf);
    }
  }
  diffAttributes(out, vnode.attributes, props, component, updateSelf);
  if (out.props) {
    out.props.children = vnode.children;
  }
  isSvgMode = prevSvgMode;
  vnode.setDom && vnode.setDom(out);
  return out;
}
function innerDiffNode(dom, vchildren, isHydrating, component, updateSelf) {
  let originalChildren = dom.childNodes, children = [], keyed = {}, keyedLen = 0, min = 0, len = originalChildren.length, childrenLen = 0, vlen = vchildren ? vchildren.length : 0, j, c, f, vchild, child;
  if (len !== 0) {
    for (let i = 0; i < len; i++) {
      let child2 = originalChildren[i], props = child2[ATTR_KEY], key = vlen && props ? child2._component ? child2._component.__key : props.key : null;
      if (key != null) {
        keyedLen++;
        keyed[key] = child2;
      } else if (props || (child2.splitText !== void 0 ? isHydrating ? child2.nodeValue.trim() : true : isHydrating)) {
        children[childrenLen++] = child2;
      }
    }
  }
  if (vlen !== 0) {
    for (let i = 0; i < vlen; i++) {
      vchild = vchildren[i];
      child = null;
      if (vchild) {
        let key = vchild.key;
        if (key != null) {
          if (keyedLen && keyed[key] !== void 0) {
            child = keyed[key];
            keyed[key] = void 0;
            keyedLen--;
          }
        } else if (!child && min < childrenLen) {
          for (j = min; j < childrenLen; j++) {
            if (children[j] !== void 0 && isSameNodeType(c = children[j], vchild, isHydrating)) {
              child = c;
              children[j] = void 0;
              if (j === childrenLen - 1)
                childrenLen--;
              if (j === min)
                min++;
              break;
            }
          }
        }
      }
      child = idiff(child, vchild, component, updateSelf);
      f = originalChildren[i];
      if (child && child !== dom && child !== f) {
        if (f == null) {
          dom.appendChild(child);
        } else if (child === f.nextSibling) {
          removeNode(f);
        } else {
          dom.insertBefore(child, f);
        }
      }
    }
  }
  if (keyedLen) {
    for (let i in keyed)
      if (keyed[i] !== void 0)
        recollectNodeTree(keyed[i], false);
  }
  while (min <= childrenLen) {
    if ((child = children[childrenLen--]) !== void 0)
      recollectNodeTree(child, false);
  }
}
function recollectNodeTree(node, unmountOnly) {
  if (node[ATTR_KEY] != null && node[ATTR_KEY].ref) {
    if (typeof node[ATTR_KEY].ref === "function") {
      node[ATTR_KEY].ref(null);
    } else if (node[ATTR_KEY].ref.current) {
      node[ATTR_KEY].ref.current = null;
    }
  }
  if (unmountOnly === false || node[ATTR_KEY] == null) {
    removeNode(node);
  }
  removeChildren(node);
}
function removeChildren(node) {
  node = node.lastChild;
  while (node) {
    let next = node.previousSibling;
    recollectNodeTree(node, true);
    node = next;
  }
}
function diffAttributes(dom, attrs, old, component, updateSelf) {
  let name;
  let isWeElement = dom.update;
  let oldClone;
  if (dom.receiveProps) {
    oldClone = Object.assign({}, old);
  }
  for (name in old) {
    if (!(attrs && attrs[name] != null) && old[name] != null) {
      setAccessor(dom, name, old[name], old[name] = void 0, isSvgMode, component);
      if (isWeElement) {
        delete dom.props[name];
      }
    }
  }
  for (name in attrs) {
    if (isWeElement && typeof attrs[name] === "object" && name !== "ref") {
      if (name === "style") {
        setAccessor(dom, name, old[name], old[name] = attrs[name], isSvgMode, component);
      }
      let ccName = camelCase(name);
      dom.props[ccName] = old[ccName] = attrs[name];
    } else if (name !== "children" && (!(name in old) || attrs[name] !== (name === "value" || name === "checked" ? dom[name] : old[name]))) {
      setAccessor(dom, name, old[name], attrs[name], isSvgMode, component);
      if (dom.nodeName.indexOf("-") !== -1) {
        dom.props = dom.props || {};
        let ccName = camelCase(name);
        dom.props[ccName] = old[ccName] = attrs[name];
      } else {
        old[name] = attrs[name];
      }
    }
  }
  if (isWeElement && !updateSelf && dom.parentNode && dom.receiveProps) {
    if (dom.receiveProps(dom.props, oldClone) !== false) {
      dom.update();
    }
  }
}

// node_modules/omi/src/we-element.js
var import_weakmap_polyfill = __toESM(require_weakmap_polyfill());
var id = 0;
var adoptedStyleSheetsMap = /* @__PURE__ */ new WeakMap();
var WeElement = class extends HTMLElement {
  constructor() {
    super();
    this.props = Object.assign({}, this.constructor.defaultProps, this.props);
    this.elementId = id++;
    this.computed = {};
    this.isInstalled = false;
  }
  connectedCallback() {
    let p = this.parentNode;
    while (p && !this.store) {
      this.store = p.store;
      p = p.parentNode || p.host;
    }
    if (this.inject) {
      this.injection = {};
      p = this.parentNode;
      let provide;
      while (p && !provide) {
        provide = p.provide;
        p = p.parentNode || p.host;
      }
      if (provide) {
        this.inject.forEach((injectKey) => {
          this.injection[injectKey] = provide[injectKey];
        });
      } else {
        throw "The provide prop was not found on the parent node or the provide type is incorrect.";
      }
    }
    this.attrsToProps();
    this.beforeInstall();
    this.install();
    this.afterInstall();
    let shadowRoot;
    if (this.constructor.isLightDom) {
      shadowRoot = this;
    } else {
      if (!this.shadowRoot) {
        shadowRoot = this.attachShadow({
          mode: "open"
        });
      } else {
        shadowRoot = this.shadowRoot;
        let fc;
        while (fc = shadowRoot.firstChild) {
          shadowRoot.removeChild(fc);
        }
      }
    }
    if (adoptedStyleSheetsMap.has(this.constructor)) {
      shadowRoot.adoptedStyleSheets = adoptedStyleSheetsMap.get(this.constructor);
    } else {
      const css = this.constructor.css;
      if (css) {
        if (typeof css === "string") {
          const styleSheet = new CSSStyleSheet();
          styleSheet.replaceSync(css);
          shadowRoot.adoptedStyleSheets = [styleSheet];
        } else if (Object.prototype.toString.call(css) === "[object Array]") {
          const styleSheets = [];
          css.forEach((styleSheet) => {
            if (typeof styleSheet === "string") {
              const adoptedStyleSheet = new CSSStyleSheet();
              adoptedStyleSheet.replaceSync(styleSheet);
              styleSheets.push(adoptedStyleSheet);
            } else {
              styleSheets.push(styleSheet);
            }
            shadowRoot.adoptedStyleSheets = styleSheets;
          });
        } else if (css.default && typeof css.default === "string") {
          const styleSheet = new CSSStyleSheet();
          styleSheet.replaceSync(css.default);
          shadowRoot.adoptedStyleSheets = [styleSheet];
        } else {
          shadowRoot.adoptedStyleSheets = [css];
        }
        adoptedStyleSheetsMap.set(this.constructor, shadowRoot.adoptedStyleSheets);
      }
    }
    this.beforeRender();
    options_default.afterInstall && options_default.afterInstall(this);
    const rendered = this.render(this.props, this.store);
    this.rootNode = diff(null, rendered, null, this);
    this.rendered();
    if (this.css) {
      shadowRoot.appendChild(cssToDom(typeof this.css === "function" ? this.css() : this.css));
    }
    if (this.props.css) {
      this._customStyleElement = cssToDom(this.props.css);
      this._customStyleContent = this.props.css;
      shadowRoot.appendChild(this._customStyleElement);
    }
    if (isArray(this.rootNode)) {
      this.rootNode.forEach(function(item) {
        shadowRoot.appendChild(item);
      });
    } else {
      this.rootNode && shadowRoot.appendChild(this.rootNode);
    }
    this.installed();
    this.isInstalled = true;
  }
  disconnectedCallback() {
    this.uninstall();
    this.isInstalled = false;
  }
  update(ignoreAttrs, updateSelf) {
    this._willUpdate = true;
    this.beforeUpdate();
    this.beforeRender();
    if (this._customStyleContent != this.props.css) {
      this._customStyleContent = this.props.css;
      if (this._customStyleElement) {
        this._customStyleElement.textContent = this._customStyleContent;
      } else {
        this._customStyleElement = cssToDom(this.props.css);
        this.shadowRoot.appendChild(this._customStyleElement);
      }
    }
    this.attrsToProps(ignoreAttrs);
    const rendered = this.render(this.props, this.store);
    this.rendered();
    this.rootNode = diff(this.rootNode, rendered, this.constructor.isLightDom ? this : this.shadowRoot, this, updateSelf);
    this._willUpdate = false;
    this.updated();
  }
  forceUpdate() {
    this.update(true);
  }
  updateProps(obj) {
    Object.keys(obj).forEach((key) => {
      this.props[key] = obj[key];
      if (this.prevProps) {
        this.prevProps[key] = obj[key];
      }
    });
    this.forceUpdate();
  }
  updateSelf(ignoreAttrs) {
    this.update(ignoreAttrs, true);
  }
  removeAttribute(key) {
    super.removeAttribute(key);
    this.isInstalled && this.update();
  }
  setAttribute(key, val) {
    if (val && typeof val === "object") {
      super.setAttribute(key, JSON.stringify(val));
    } else {
      super.setAttribute(key, val);
    }
    this.isInstalled && this.update();
  }
  pureRemoveAttribute(key) {
    super.removeAttribute(key);
  }
  pureSetAttribute(key, val) {
    super.setAttribute(key, val);
  }
  attrsToProps(ignoreAttrs) {
    if (ignoreAttrs || this.store && this.store.ignoreAttrs || this.props.ignoreAttrs)
      return;
    const ele = this;
    ele.props["css"] = ele.getAttribute("css");
    const attrs = this.constructor.propTypes;
    if (!attrs)
      return;
    Object.keys(attrs).forEach((key) => {
      const type = attrs[key];
      const val = ele.getAttribute(hyphenate(key));
      if (val !== null) {
        switch (type) {
          case String:
            ele.props[key] = val;
            break;
          case Number:
            ele.props[key] = Number(val);
            break;
          case Boolean:
            if (val === "false" || val === "0") {
              ele.props[key] = false;
            } else {
              ele.props[key] = true;
            }
            break;
          case Array:
          case Object:
            if (val[0] === ":") {
              ele.props[key] = getValByPath2(val.substr(1), Omi.$);
            } else {
              ele.props[key] = JSON.parse(val.replace(/(['"])?([a-zA-Z0-9_-]+)(['"])?:([^\/])/g, '"$2":$4').replace(/'([\s\S]*?)'/g, '"$1"').replace(/,(\s*})/g, "$1"));
            }
            break;
        }
      } else {
        if (ele.constructor.defaultProps && ele.constructor.defaultProps.hasOwnProperty(key)) {
          ele.props[key] = ele.constructor.defaultProps[key];
        } else {
          ele.props[key] = null;
        }
      }
    });
  }
  fire(name, data) {
    const handler2 = this.props[`on${capitalize(name)}`];
    if (handler2) {
      handler2(new CustomEvent(name, {
        detail: data
      }));
    } else {
      this.dispatchEvent(new CustomEvent(name, {
        detail: data
      }));
    }
  }
  beforeInstall() {
  }
  install() {
  }
  afterInstall() {
  }
  installed() {
  }
  uninstall() {
  }
  beforeUpdate() {
  }
  updated() {
  }
  beforeRender() {
  }
  rendered() {
  }
  receiveProps() {
  }
};
__publicField(WeElement, "is", "WeElement");

// node_modules/omi/src/render.js
function render(vnode, parent, store) {
  parent = typeof parent === "string" ? document.querySelector(parent) : parent;
  if (store) {
    parent.store = store;
  }
  return diff(null, vnode, parent, false);
}

// node_modules/omi/src/define.js
var storeHelpers = ["use", "useSelf"];
function define(name, ctor, config) {
  if (customElements.get(name)) {
    return;
  }
  if (options_default.mapping[name]) {
    return;
  }
  if (ctor.is === "WeElement") {
    customElements.define(name, ctor);
    options_default.mapping[name] = ctor;
  } else {
    if (typeof config === "string") {
      config = { css: config };
    } else {
      config = config || {};
    }
    class Ele extends WeElement {
      static css = config.css;
      static propTypes = config.propTypes;
      static defaultProps = config.defaultProps;
      static isLightDom = config.isLightDom;
      compute = config.compute;
      render() {
        return ctor.call(this, this);
      }
    }
    for (let key in config) {
      if (typeof config[key] === "function") {
        Ele.prototype[key] = function() {
          return config[key].apply(this, arguments);
        };
      }
    }
    storeHelpers.forEach((func) => {
      if (config[func] && config[func] !== "function") {
        Ele.prototype[func] = function() {
          return config[func];
        };
      }
    });
    customElements.define(name, Ele);
    options_default.mapping[name] = Ele;
  }
}

// node_modules/omi/src/tag.js
function tag(name) {
  return function(target) {
    define(name, target);
  };
}

// node_modules/omi/src/clone-element.js
function cloneElement(vnode, props) {
  return h(vnode.nodeName, extend(extend({}, vnode.attributes), props), arguments.length > 2 ? [].slice.call(arguments, 2) : vnode.children);
}

// node_modules/omi/src/get-host.js
function getHost(ele) {
  let root2 = ele.getRootNode();
  return root2 && root2.host;
}

// node_modules/omi/src/rpx.js
function rpx(css) {
  return css.replace(/([1-9]\d*|0)(\.\d*)*rpx/g, (a, b) => {
    return window.innerWidth * Number(b) / 750 + "px";
  });
}

// node_modules/omi/src/class.js
var hasOwn = {}.hasOwnProperty;
function classNames() {
  var classes = [];
  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    if (!arg)
      continue;
    var argType = typeof arg;
    if (argType === "string" || argType === "number") {
      classes.push(arg);
    } else if (Array.isArray(arg) && arg.length) {
      var inner = classNames.apply(null, arg);
      if (inner) {
        classes.push(inner);
      }
    } else if (argType === "object") {
      for (var key in arg) {
        if (hasOwn.call(arg, key) && arg[key]) {
          classes.push(key);
        }
      }
    }
  }
  return classes.join(" ");
}
function extractClass() {
  const [props, ...args] = Array.prototype.slice.call(arguments, 0);
  if (props.class) {
    args.unshift(props.class);
    delete props.class;
  } else if (props.className) {
    args.unshift(props.className);
    delete props.className;
  }
  if (args.length > 0) {
    return { class: classNames.apply(null, args) };
  }
}

// node_modules/omi/src/o.js
function o(obj) {
  return JSON.stringify(obj);
}

// node_modules/construct-style-sheets-polyfill/dist/adoptedStyleSheets.js
(function() {
  "use strict";
  if (typeof document === "undefined" || "adoptedStyleSheets" in document) {
    return;
  }
  var hasShadyCss = "ShadyCSS" in window && !ShadyCSS.nativeShadow;
  var bootstrapper = document.implementation.createHTMLDocument("boot");
  var closedShadowRootRegistry = /* @__PURE__ */ new WeakMap();
  var _DOMException = typeof DOMException === "object" ? Error : DOMException;
  var defineProperty = Object.defineProperty;
  var forEach = Array.prototype.forEach;
  var importPattern = /@import.+?;?$/gm;
  function rejectImports(contents) {
    var _contents = contents.replace(importPattern, "");
    if (_contents !== contents) {
      console.warn("@import rules are not allowed here. See https://github.com/WICG/construct-stylesheets/issues/119#issuecomment-588352418");
    }
    return _contents.trim();
  }
  function clearRules(sheet) {
    for (var i = 0; i < sheet.cssRules.length; i++) {
      sheet.deleteRule(0);
    }
  }
  function insertAllRules(from, to) {
    forEach.call(from.cssRules, function(rule, i) {
      to.insertRule(rule.cssText, i);
    });
  }
  function isElementConnected(element) {
    return "isConnected" in element ? element.isConnected : document.contains(element);
  }
  function unique(arr) {
    return arr.filter(function(value, index) {
      return arr.indexOf(value) === index;
    });
  }
  function diff2(arr1, arr2) {
    return arr1.filter(function(value) {
      return arr2.indexOf(value) === -1;
    });
  }
  function removeNode2(node) {
    node.parentNode.removeChild(node);
  }
  function getShadowRoot(element) {
    return element.shadowRoot || closedShadowRootRegistry.get(element);
  }
  var cssStyleSheetMethods = [
    "addImport",
    "addPageRule",
    "addRule",
    "deleteRule",
    "insertRule",
    "removeImport",
    "removeRule"
  ];
  var NonConstructedStyleSheet = CSSStyleSheet;
  var nonConstructedProto = NonConstructedStyleSheet.prototype;
  nonConstructedProto.replace = function() {
    return Promise.reject(new _DOMException("Can't call replace on non-constructed CSSStyleSheets."));
  };
  nonConstructedProto.replaceSync = function() {
    throw new _DOMException("Failed to execute 'replaceSync' on 'CSSStyleSheet': Can't call replaceSync on non-constructed CSSStyleSheets.");
  };
  function isCSSStyleSheetInstance(instance) {
    return typeof instance === "object" ? proto$2.isPrototypeOf(instance) || nonConstructedProto.isPrototypeOf(instance) : false;
  }
  function isNonConstructedStyleSheetInstance(instance) {
    return typeof instance === "object" ? nonConstructedProto.isPrototypeOf(instance) : false;
  }
  var $basicStyleSheet = /* @__PURE__ */ new WeakMap();
  var $locations = /* @__PURE__ */ new WeakMap();
  var $adoptersByLocation = /* @__PURE__ */ new WeakMap();
  function addAdopterLocation(sheet, location2) {
    var adopter = document.createElement("style");
    $adoptersByLocation.get(sheet).set(location2, adopter);
    $locations.get(sheet).push(location2);
    return adopter;
  }
  function getAdopterByLocation(sheet, location2) {
    return $adoptersByLocation.get(sheet).get(location2);
  }
  function removeAdopterLocation(sheet, location2) {
    $adoptersByLocation.get(sheet).delete(location2);
    $locations.set(sheet, $locations.get(sheet).filter(function(_location) {
      return _location !== location2;
    }));
  }
  function restyleAdopter(sheet, adopter) {
    requestAnimationFrame(function() {
      clearRules(adopter.sheet);
      insertAllRules($basicStyleSheet.get(sheet), adopter.sheet);
    });
  }
  function checkInvocationCorrectness(self2) {
    if (!$basicStyleSheet.has(self2)) {
      throw new TypeError("Illegal invocation");
    }
  }
  function ConstructedStyleSheet() {
    var self2 = this;
    var style = document.createElement("style");
    bootstrapper.body.appendChild(style);
    $basicStyleSheet.set(self2, style.sheet);
    $locations.set(self2, []);
    $adoptersByLocation.set(self2, /* @__PURE__ */ new WeakMap());
  }
  var proto$2 = ConstructedStyleSheet.prototype;
  proto$2.replace = function replace(contents) {
    try {
      this.replaceSync(contents);
      return Promise.resolve(this);
    } catch (e) {
      return Promise.reject(e);
    }
  };
  proto$2.replaceSync = function replaceSync(contents) {
    checkInvocationCorrectness(this);
    if (typeof contents === "string") {
      var self_1 = this;
      var style = $basicStyleSheet.get(self_1).ownerNode;
      style.textContent = rejectImports(contents);
      $basicStyleSheet.set(self_1, style.sheet);
      $locations.get(self_1).forEach(function(location2) {
        if (location2.isConnected()) {
          restyleAdopter(self_1, getAdopterByLocation(self_1, location2));
        }
      });
    }
  };
  defineProperty(proto$2, "cssRules", {
    configurable: true,
    enumerable: true,
    get: function cssRules() {
      checkInvocationCorrectness(this);
      return $basicStyleSheet.get(this).cssRules;
    }
  });
  cssStyleSheetMethods.forEach(function(method) {
    proto$2[method] = function() {
      var self2 = this;
      checkInvocationCorrectness(self2);
      var args = arguments;
      var basic = $basicStyleSheet.get(self2);
      var locations2 = $locations.get(self2);
      var result = basic[method].apply(basic, args);
      locations2.forEach(function(location2) {
        if (location2.isConnected()) {
          var sheet = getAdopterByLocation(self2, location2).sheet;
          sheet[method].apply(sheet, args);
        }
      });
      return result;
    };
  });
  defineProperty(ConstructedStyleSheet, Symbol.hasInstance, {
    configurable: true,
    value: isCSSStyleSheetInstance
  });
  var defaultObserverOptions = {
    childList: true,
    subtree: true
  };
  var locations = /* @__PURE__ */ new WeakMap();
  function getAssociatedLocation(element) {
    var location2 = locations.get(element);
    if (!location2) {
      location2 = new Location(element);
      locations.set(element, location2);
    }
    return location2;
  }
  function attachAdoptedStyleSheetProperty(constructor) {
    defineProperty(constructor.prototype, "adoptedStyleSheets", {
      configurable: true,
      enumerable: true,
      get: function() {
        return getAssociatedLocation(this).sheets;
      },
      set: function(sheets) {
        getAssociatedLocation(this).update(sheets);
      }
    });
  }
  function traverseWebComponents(node, callback) {
    var iter = document.createNodeIterator(node, NodeFilter.SHOW_ELEMENT, function(foundNode) {
      return getShadowRoot(foundNode) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
    }, null, false);
    for (var next = void 0; next = iter.nextNode(); ) {
      callback(getShadowRoot(next));
    }
  }
  var $element = /* @__PURE__ */ new WeakMap();
  var $uniqueSheets = /* @__PURE__ */ new WeakMap();
  var $observer = /* @__PURE__ */ new WeakMap();
  function isExistingAdopter(self2, element) {
    return element instanceof HTMLStyleElement && $uniqueSheets.get(self2).some(function(sheet) {
      return getAdopterByLocation(sheet, self2);
    });
  }
  function getAdopterContainer(self2) {
    var element = $element.get(self2);
    return element instanceof Document ? element.body : element;
  }
  function adopt(self2) {
    var styleList = document.createDocumentFragment();
    var sheets = $uniqueSheets.get(self2);
    var observer = $observer.get(self2);
    var container = getAdopterContainer(self2);
    observer.disconnect();
    sheets.forEach(function(sheet) {
      styleList.appendChild(getAdopterByLocation(sheet, self2) || addAdopterLocation(sheet, self2));
    });
    container.insertBefore(styleList, null);
    observer.observe(container, defaultObserverOptions);
    sheets.forEach(function(sheet) {
      restyleAdopter(sheet, getAdopterByLocation(sheet, self2));
    });
  }
  function Location(element) {
    var self2 = this;
    self2.sheets = [];
    $element.set(self2, element);
    $uniqueSheets.set(self2, []);
    $observer.set(self2, new MutationObserver(function(mutations, observer) {
      if (!document) {
        observer.disconnect();
        return;
      }
      mutations.forEach(function(mutation) {
        if (!hasShadyCss) {
          forEach.call(mutation.addedNodes, function(node) {
            if (!(node instanceof Element)) {
              return;
            }
            traverseWebComponents(node, function(root2) {
              getAssociatedLocation(root2).connect();
            });
          });
        }
        forEach.call(mutation.removedNodes, function(node) {
          if (!(node instanceof Element)) {
            return;
          }
          if (isExistingAdopter(self2, node)) {
            adopt(self2);
          }
          if (!hasShadyCss) {
            traverseWebComponents(node, function(root2) {
              getAssociatedLocation(root2).disconnect();
            });
          }
        });
      });
    }));
  }
  var proto$1 = Location.prototype;
  proto$1.isConnected = function isConnected() {
    var element = $element.get(this);
    return element instanceof Document ? element.readyState !== "loading" : isElementConnected(element.host);
  };
  proto$1.connect = function connect() {
    var container = getAdopterContainer(this);
    $observer.get(this).observe(container, defaultObserverOptions);
    if ($uniqueSheets.get(this).length > 0) {
      adopt(this);
    }
    traverseWebComponents(container, function(root2) {
      getAssociatedLocation(root2).connect();
    });
  };
  proto$1.disconnect = function disconnect() {
    $observer.get(this).disconnect();
  };
  proto$1.update = function update(sheets) {
    var self2 = this;
    var locationType = $element.get(self2) === document ? "Document" : "ShadowRoot";
    if (!Array.isArray(sheets)) {
      throw new TypeError("Failed to set the 'adoptedStyleSheets' property on " + locationType + ": Iterator getter is not callable.");
    }
    if (!sheets.every(isCSSStyleSheetInstance)) {
      throw new TypeError("Failed to set the 'adoptedStyleSheets' property on " + locationType + ": Failed to convert value to 'CSSStyleSheet'");
    }
    if (sheets.some(isNonConstructedStyleSheetInstance)) {
      throw new TypeError("Failed to set the 'adoptedStyleSheets' property on " + locationType + ": Can't adopt non-constructed stylesheets");
    }
    self2.sheets = sheets;
    var oldUniqueSheets = $uniqueSheets.get(self2);
    var uniqueSheets = unique(sheets);
    var removedSheets = diff2(oldUniqueSheets, uniqueSheets);
    removedSheets.forEach(function(sheet) {
      removeNode2(getAdopterByLocation(sheet, self2));
      removeAdopterLocation(sheet, self2);
    });
    $uniqueSheets.set(self2, uniqueSheets);
    if (self2.isConnected() && uniqueSheets.length > 0) {
      adopt(self2);
    }
  };
  window.CSSStyleSheet = ConstructedStyleSheet;
  attachAdoptedStyleSheetProperty(Document);
  if ("ShadowRoot" in window) {
    attachAdoptedStyleSheetProperty(ShadowRoot);
    var proto = Element.prototype;
    var attach_1 = proto.attachShadow;
    proto.attachShadow = function attachShadow(init) {
      var root2 = attach_1.call(this, init);
      if (init.mode === "closed") {
        closedShadowRootRegistry.set(this, root2);
      }
      return root2;
    };
  }
  var documentLocation = getAssociatedLocation(document);
  if (documentLocation.isConnected()) {
    documentLocation.connect();
  } else {
    document.addEventListener("DOMContentLoaded", documentLocation.connect.bind(documentLocation));
  }
})();

// node_modules/omi/src/omi.js
h.f = Fragment;
function createRef() {
  return {};
}
var $ = {};
var Component = WeElement;
var defineElement = define;
var elements = options_default.mapping;
var omi = {
  tag,
  WeElement,
  Component,
  render,
  h,
  createElement: h,
  options: options_default,
  define,
  cloneElement,
  getHost,
  rpx,
  defineElement,
  classNames,
  extractClass,
  createRef,
  o,
  elements,
  $,
  extend: extend2,
  get,
  set,
  bind,
  unbind
};
options_default.root.Omi = omi;
options_default.root.omi = omi;
options_default.root.Omi.version = "6.25.9";

// node_modules/dynamic-apis/src/request.js
var createHeaders = (headers) => {
  return new Headers({
    "Content-Type": "application/json",
    ...typeof headers == "function" ? headers() : headers
  });
};
var buildParams = (searchParams, parentKey = "", params = {}) => {
  for (let key in params) {
    const value = params[key];
    if (value === null || typeof value !== "object") {
      searchParams.set(`${parentKey}${key}`, value);
      continue;
    }
    buildParams(searchParams, `${parentKey}${key}.`, value);
  }
};
var buildURL = (url, params = {}) => {
  const reqURL = new URL(url);
  buildParams(reqURL.searchParams, "", params);
  return reqURL.href;
};
var buildRequest = (method, url, data, headers) => {
  if (method == "GET" || method == "DELETE") {
    url = buildURL(url, data);
    data = null;
  }
  return new Request(url, {
    method,
    headers: createHeaders(headers),
    body: data != null ? JSON.stringify(data) : null
  });
};
var processRequest = async (method, url, data, headers) => {
  let req = buildRequest(method, url, data, headers ?? {});
  return fetch(req).then((rsp) => {
    if (!rsp.ok) {
      let errorEvent = new CustomEvent("fetcherror", {
        detail: {
          method: req.method,
          url: req.url,
          body: data,
          status: rsp.status,
          statusText: rsp.statusText
        }
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
      console.error(`fetch ${req.url} error\uFF0C\u8FD4\u56DE\u503C\u4E0D\u662FJSON`, exc);
    }
  });
};
var request = {
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
  }
};
var request_default = request;

// node_modules/dynamic-apis/src/controller.js
var Controller = class {
  #tableName = "";
  #controllerURL = "";
  #headers = {};
  constructor(name, baseUrl, headers) {
    name = name + "";
    if (name.startsWith("/")) {
      name = name.substr(1);
    }
    this.#headers = headers ?? {};
    this.#tableName = name;
    this.#controllerURL = new URL(name, baseUrl).href;
  }
  get headers() {
    return this.#headers;
  }
  get controllerURL() {
    return this.#controllerURL;
  }
  id(id2) {
    return createController(id2, this.controllerURL + "/", this.headers);
  }
  path(path) {
    return createController(path, this.controllerURL + "/", this.headers);
  }
  async get(id2) {
    let url = `${this.controllerURL}`;
    let data = null;
    if (id2 instanceof Array) {
      url = `${this.controllerURL}/${id2.join(",")}`;
    } else if (typeof id2 == "object") {
      data = id2;
    } else if (arguments.length) {
      url = `${this.controllerURL}/${[...arguments].join(",")}`;
    }
    return request_default.get(url, data, this.headers);
  }
  async post(item) {
    return request_default.post(this.controllerURL, item, this.headers);
  }
  async put(id2, item) {
    if (item == void 0) {
      throw new Error("\u53C2\u6570\u6570\u91CF\u4E0D\u5BF9");
    }
    return request_default.put(`${this.controllerURL}/${id2}`, item, this.headers);
  }
  async patch(id2, item) {
    if (item == void 0) {
      throw new Error("\u53C2\u6570\u6570\u91CF\u4E0D\u5BF9");
    }
    return request_default.patch(`${this.controllerURL}/${id2}`, item, this.headers);
  }
  async delete(id2) {
    let url = `${this.controllerURL}`;
    let data = null;
    if (id2 instanceof Array) {
      url = `${this.controllerURL}/${id2.join(",")}`;
    } else if (typeof id2 == "object") {
      data = id2;
    } else if (arguments.length) {
      url = `${this.controllerURL}/${[...arguments].join(",")}`;
    }
    return request_default.delete(url, data, this.headers);
  }
  add = this.post;
  update = this.put;
  modify = this.patch;
  del = this.delete;
};
var handler = {
  get(target, property, receiver) {
    if (property in target) {
      return target[property];
    }
    let match = /^(?<action>get|add|post|update|put|patch|modify|del|delete)(?<name>\w+)/i.exec(property);
    if (match) {
      let [first, ...rest] = match.groups.name;
      let name = [first.toLowerCase(), ...rest].join("");
      let controller = new Controller(name, target.controllerURL + "/", target.headers);
      return controller[match.groups.action].bind(controller);
    }
    return createController(property, target.controllerURL + "/", target.headers);
  }
};
var createController = (name, baseUrl, headers) => {
  return new Proxy(new Controller(name, baseUrl, headers), handler);
};

// node_modules/dynamic-apis/src/index.js
var src_default = {
  request: request_default,
  createController
};

// node_modules/htm/dist/htm.module.js
var n = function(t2, s, r, e) {
  var u;
  s[0] = 0;
  for (var h2 = 1; h2 < s.length; h2++) {
    var p = s[h2++], a = s[h2] ? (s[0] |= p ? 1 : 2, r[s[h2++]]) : s[++h2];
    3 === p ? e[0] = a : 4 === p ? e[1] = Object.assign(e[1] || {}, a) : 5 === p ? (e[1] = e[1] || {})[s[++h2]] = a : 6 === p ? e[1][s[++h2]] += a + "" : p ? (u = t2.apply(a, n(t2, a, r, ["", null])), e.push(u), a[0] ? s[0] |= 2 : (s[h2 - 2] = 0, s[h2] = u)) : e.push(a);
  }
  return e;
};
var t = /* @__PURE__ */ new Map();
function htm_module_default(s) {
  var r = t.get(this);
  return r || (r = /* @__PURE__ */ new Map(), t.set(this, r)), (r = n(this, r.get(s) || (r.set(s, r = function(n2) {
    for (var t2, s2, r2 = 1, e = "", u = "", h2 = [0], p = function(n3) {
      1 === r2 && (n3 || (e = e.replace(/^\s*\n\s*|\s*\n\s*$/g, ""))) ? h2.push(0, n3, e) : 3 === r2 && (n3 || e) ? (h2.push(3, n3, e), r2 = 2) : 2 === r2 && "..." === e && n3 ? h2.push(4, n3, 0) : 2 === r2 && e && !n3 ? h2.push(5, 0, true, e) : r2 >= 5 && ((e || !n3 && 5 === r2) && (h2.push(r2, 0, e, s2), r2 = 6), n3 && (h2.push(r2, n3, 0, s2), r2 = 6)), e = "";
    }, a = 0; a < n2.length; a++) {
      a && (1 === r2 && p(), p(a));
      for (var l = 0; l < n2[a].length; l++)
        t2 = n2[a][l], 1 === r2 ? "<" === t2 ? (p(), h2 = [h2], r2 = 3) : e += t2 : 4 === r2 ? "--" === e && ">" === t2 ? (r2 = 1, e = "") : e = t2 + e[0] : u ? t2 === u ? u = "" : e += t2 : '"' === t2 || "'" === t2 ? u = t2 : ">" === t2 ? (p(), r2 = 1) : r2 && ("=" === t2 ? (r2 = 5, s2 = e, e = "") : "/" === t2 && (r2 < 5 || ">" === n2[a][l + 1]) ? (p(), 3 === r2 && (h2 = h2[0]), r2 = h2, (h2 = h2[0]).push(2, 0, r2), r2 = 0) : " " === t2 || "	" === t2 || "\n" === t2 || "\r" === t2 ? (p(), r2 = 2) : e += t2), 3 === r2 && "!--" === e && (r2 = 4, h2 = h2[0]);
    }
    return p(), h2;
  }(s)), r), arguments, [])).length > 1 ? r : r[0];
}

// src/stylesheet.js
var createStyleSheet = (href) => {
  let link = document.createElement("link");
  link.setAttribute("href", href);
  link.setAttribute("rel", "stylesheet");
  return link;
};
var createStyleSheets = (hrefs) => {
  return hrefs.map(createStyleSheet);
};
var purgeCSSSS = async (css, owner) => {
  return purgeCSS(css, owner, true);
};
var purgeCSS = async (css, owner, buildCSSStyleSheet = false) => {
  const cssss = [];
  const stack2 = [css];
  while (stack2.length) {
    let _css = stack2.shift();
    if (_css instanceof Promise) {
      _css = await _css;
    }
    if (!_css)
      continue;
    if (typeof _css == "function") {
      const result = _css.call(owner);
      stack2.unshift(result);
      continue;
    }
    if (_css instanceof Array) {
      stack2.unshift(..._css);
      continue;
    }
    if (_css.default) {
      stack2.unshift(_css.default);
      continue;
    }
    if (typeof _css === "string") {
      if (buildCSSStyleSheet === false) {
        cssss.push(_css);
        continue;
      }
      let styleSheet = new CSSStyleSheet();
      styleSheet.replaceSync(_css);
      cssss.push(styleSheet);
    }
    if (_css instanceof CSSStyleSheet) {
      cssss.push(_css);
    }
  }
  return cssss;
};

// src/updateTargets.js
function handleTargets(targets, parent) {
  let $targets = [];
  if (!targets)
    return $targets;
  if (targets instanceof Array) {
    for (let target of targets) {
      $targets.push(...handleTargets(target, parent));
    }
  } else if (targets instanceof HTMLCollection || targets instanceof NodeList) {
    $targets = [...targets];
  } else if (targets instanceof HTMLElement) {
    $targets.push(targets);
  } else if (typeof targets === "string") {
    $targets = [...parent?.querySelectorAll(targets) ?? []];
  }
  return $targets;
}
function updateTargets(targets, parent = document, ignoreAttrs = false, cascade = true) {
  let $targets = handleTargets(targets, parent);
  let tags = Object.keys(elements);
  let tagsQuery = tags.join(",");
  let updateSelf = !cascade;
  for (let $target of $targets) {
    if ("update" in $target) {
      $target.update(ignoreAttrs, updateSelf);
    } else {
      let $chidren = [...$target.querySelectorAll(tagsQuery)];
      for (let $child of $chidren) {
        $child.update(ignoreAttrs, updateSelf);
      }
    }
  }
}

// node_modules/throttle-debounce/esm/index.js
function throttle(delay, callback, options) {
  var _ref = options || {}, _ref$noTrailing = _ref.noTrailing, noTrailing = _ref$noTrailing === void 0 ? false : _ref$noTrailing, _ref$noLeading = _ref.noLeading, noLeading = _ref$noLeading === void 0 ? false : _ref$noLeading, _ref$debounceMode = _ref.debounceMode, debounceMode = _ref$debounceMode === void 0 ? void 0 : _ref$debounceMode;
  var timeoutID;
  var cancelled = false;
  var lastExec = 0;
  function clearExistingTimeout() {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
  }
  function cancel(options2) {
    var _ref2 = options2 || {}, _ref2$upcomingOnly = _ref2.upcomingOnly, upcomingOnly = _ref2$upcomingOnly === void 0 ? false : _ref2$upcomingOnly;
    clearExistingTimeout();
    cancelled = !upcomingOnly;
  }
  function wrapper() {
    for (var _len = arguments.length, arguments_ = new Array(_len), _key = 0; _key < _len; _key++) {
      arguments_[_key] = arguments[_key];
    }
    var self2 = this;
    var elapsed = Date.now() - lastExec;
    if (cancelled) {
      return;
    }
    function exec() {
      lastExec = Date.now();
      callback.apply(self2, arguments_);
    }
    function clear() {
      timeoutID = void 0;
    }
    if (!noLeading && debounceMode && !timeoutID) {
      exec();
    }
    clearExistingTimeout();
    if (debounceMode === void 0 && elapsed > delay) {
      if (noLeading) {
        lastExec = Date.now();
        if (!noTrailing) {
          timeoutID = setTimeout(debounceMode ? clear : exec, delay);
        }
      } else {
        exec();
      }
    } else if (noTrailing !== true) {
      timeoutID = setTimeout(debounceMode ? clear : exec, debounceMode === void 0 ? delay - elapsed : delay);
    }
  }
  wrapper.cancel = cancel;
  return wrapper;
}
function debounce(delay, callback, options) {
  var _ref = options || {}, _ref$atBegin = _ref.atBegin, atBegin = _ref$atBegin === void 0 ? false : _ref$atBegin;
  return throttle(delay, callback, {
    debounceMode: atBegin !== false
  });
}

// src/theme.js
var themeCSSStyleSheet = new CSSStyleSheet();
var theme_default = themeCSSStyleSheet;
function setTheme(css) {
  if (typeof css == "string")
    themeCSSStyleSheet.replace(css);
}

// src/component.js
var UpdateInterval = 13;
var adoptedStyleSheetsMap2 = /* @__PURE__ */ new WeakMap();
var component_default = class extends WeElement {
  #store = null;
  get store() {
    if (this.#store)
      return this.#store;
    let p = this.parentNode;
    while (p && !p.store) {
      p = p.parentNode || p.host;
    }
    if (p)
      this.#store = p.store;
    else
      this.#store = {};
    return this.#store;
  }
  set store(value) {
    this.#store = value;
  }
  #injection = null;
  get injection() {
    if (this.#injection)
      return this.#injection;
    if (this.inject) {
      this.#injection = {};
      let p = this.parentNode;
      let provide;
      while (p && !provide) {
        provide = p.provide;
        p = p.parentNode || p.host;
      }
      if (provide) {
        this.inject.forEach((injectKey) => {
          this.injection[injectKey] = provide[injectKey];
        });
      } else {
        throw "The provide prop was not found on the parent node or the provide type is incorrect.";
      }
    }
  }
  async connectedCallback() {
    this.attrsToProps();
    let $props = this.props.props;
    if ($props && typeof $props === "object") {
      this.$props = $props;
      for (let pp in this.props) {
        if (pp !== "props" && pp !== "children" && !$props.hasOwnProperty(pp)) {
          $props[pp] = this.props[pp];
        }
      }
    } else {
      this.$props = this.props;
    }
    let shadowRoot;
    if (this.constructor.isLightDom) {
      shadowRoot = this;
    } else {
      if (!this.shadowRoot) {
        shadowRoot = this.attachShadow({
          mode: "open"
        });
      } else {
        shadowRoot = this.shadowRoot;
        let fc;
        while (fc = shadowRoot.firstChild) {
          shadowRoot.removeChild(fc);
        }
      }
    }
    await this.beforeInstall();
    await this.install();
    await this.afterInstall();
    await this.beforeRender();
    options_default.afterInstall && await options_default.afterInstall(this);
    const rendered = await this.render(this.props, this.store);
    await this.rendered();
    this.rootNode = diff(null, rendered, null, this);
    if (isArray(this.rootNode)) {
      this.rootNode.forEach(function(item) {
        shadowRoot.appendChild(item);
      });
    } else {
      this.rootNode && shadowRoot.appendChild(this.rootNode);
    }
    await this.#initStyle();
    await this.installed();
    this.isInstalled = true;
    this.fire("installed");
  }
  async disconnectedCallback() {
    await this.uninstall();
    this.isInstalled = false;
  }
  #css = {
    default_css_content: null,
    default_cssstylesheet: new CSSStyleSheet(),
    props_css_content: null,
    props_cssstylesheet: new CSSStyleSheet(),
    csssses: [],
    stylesheetMap: /* @__PURE__ */ new Map(),
    theme_css: null,
    theme_cssstylesheet: new CSSStyleSheet()
  };
  get themeCSSStyleSheet() {
    if (!this.$props.themeCss) {
      let host = getHost(this);
      if (!host) {
        return this.#css.theme_cssstylesheet;
      }
      return host.themeCSSStyleSheet;
    } else {
      if (this.$props.themeCss instanceof CSSStyleSheet) {
        return this.$props.themeCss;
      }
      if (this.$props.themeCss != this.#css.theme_css) {
        this.#css.theme_css = this.$props.themeCss;
        this.#css.theme_cssstylesheet.replace(this.#css.theme_css);
      }
      return this.#css.theme_cssstylesheet;
    }
  }
  async #initStyle() {
    if (this.constructor.isLightDom !== true) {
      let cssss = adoptedStyleSheetsMap2.get(this.constructor);
      if (cssss === void 0) {
        let resolves = [];
        resolves.__r__ = true;
        adoptedStyleSheetsMap2.set(this.constructor, resolves);
        cssss = await purgeCSSSS(this.constructor.css, this);
        adoptedStyleSheetsMap2.set(this.constructor, cssss);
        resolves.forEach((resolve) => {
          resolve(cssss);
        });
      } else if (cssss instanceof Array && cssss.__r__) {
        let resolves = cssss;
        cssss = await new Promise((resolve) => {
          resolves.push(resolve);
        });
      }
      this.shadowRoot.adoptedStyleSheets = [...cssss, this.#css.default_cssstylesheet, this.#css.props_cssstylesheet, this.themeCSSStyleSheet, theme_default];
      createStyleSheets(await purgeCSS(this.constructor.stylesheets, this)).forEach((link) => {
        this.shadowRoot.appendChild(link);
      });
    }
    await this.updateStyle();
  }
  async updateStyle() {
    if (this.constructor.isLightDom === true)
      return;
    if (this.css) {
      const css_content = (await purgeCSS(this.css, this)).join("\n");
      if (this.#css.default_css_content != css_content) {
        this.#css.default_css_content = css_content;
        this.#css.default_cssstylesheet.replaceSync(css_content);
      }
    }
    if (typeof this.props.css == "string") {
      if (this.#css.props_css_content != this.props.css) {
        this.#css.props_css_content = this.props.css;
        this.#css.props_cssstylesheet.replaceSync(this.props.css);
      }
    }
    const csssses = await purgeCSSSS(this.cssss, this);
    csssses.push(...await purgeCSSSS(this.props.cssss, getHost(this)));
    const shadowRoot = this.shadowRoot ?? this;
    if (this.#css.csssses.length !== csssses.length || csssses.some((v, index) => v != this.#css.csssses[index])) {
      const adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets];
      adoptedStyleSheets.splice(-(this.#css.csssses.length + 2), this.#css.csssses.length + 1, ...csssses, this.themeCSSStyleSheet);
      shadowRoot.adoptedStyleSheets = adoptedStyleSheets;
      this.#css.csssses = csssses;
    }
    const stylesheets = await purgeCSS(this.stylesheets, this);
    stylesheets.push(...await purgeCSS(this.props.styleSheets, getHost(this)));
    const stylesheetMap = this.#css.stylesheetMap;
    const exsistStylesheets = new Set(stylesheetMap.keys());
    stylesheets.forEach((href) => {
      if (!stylesheetMap.has(href)) {
        let stylesheetEle = createStyleSheet(href);
        shadowRoot.appendChild(stylesheetEle);
        stylesheetMap.set(href, stylesheetEle);
      }
      exsistStylesheets.delete(href);
    });
    exsistStylesheets.forEach((href) => {
      const link = stylesheetMap.get(href);
      if (link) {
        shadowRoot.removeChild(link);
        stylesheetMap.delete(href);
      }
    });
    this.styleUpdated && this.styleUpdated();
    this.fire("styleUpdated");
  }
  updateTargets(targets, ignoreAttrs = true, cascade = true) {
    updateTargets(targets, this.shadowRoot ?? this, ignoreAttrs, cascade);
  }
  async update(ignoreAttrs, updateSelf) {
    if (this._willUpdate === true)
      return;
    this._willUpdate = true;
    try {
      await this.beforeUpdate();
      await this.beforeRender();
      this.attrsToProps(ignoreAttrs);
      const rendered = await this.render(this.props, this.store);
      await this.rendered();
      this.rootNode = diff(this.rootNode, rendered, this.constructor.isLightDom ? this : this.shadowRoot, this, updateSelf);
      await this.updateStyle();
    } finally {
      this._willUpdate = false;
      await this.updated();
    }
  }
  lazyUpdate = throttle(UpdateInterval, (ignoreAttrs, updateSelf) => {
    this.update(ignoreAttrs, updateSelf);
  });
  async forceUpdateSelf() {
    await this.update(true, true);
  }
  update$Props(obj, ignoreAttrs = true, updateSelf = false, updateAttrs = false) {
    Object.keys(obj).forEach((key) => {
      let value = obj[key];
      this.$props[key] = value;
      if (this.prevProps && this.$props == this.props) {
        this.prevProps[key] = value;
      }
      if (updateAttrs) {
        this.pureSetAttribute(key, value);
      }
    });
    this.update(ignoreAttrs, updateSelf);
  }
  attrsToProps(ignoreAttrs) {
    if (ignoreAttrs || this.props.ignoreAttrs)
      return;
    const ele = this;
    ele.props["css"] = ele.getAttribute("css");
    const attrs = this.constructor.propTypes;
    if (!attrs)
      return;
    Object.keys(attrs).forEach((key) => {
      const type = attrs[key];
      const val = ele.getAttribute(hyphenate(key));
      if (val !== null) {
        switch (type) {
          case String:
            ele.props[key] = val;
            break;
          case Number:
            ele.props[key] = Number(val);
            break;
          case Boolean:
            if (val === "false" || val === "0") {
              ele.props[key] = false;
            } else {
              ele.props[key] = true;
            }
            break;
          case Array:
          case Object:
            if (val[0] === ":") {
              ele.props[key] = getValByPath(val.substr(1), Omi.$);
            } else {
              ele.props[key] = JSON.parse(val.replace(/(['"])?([a-zA-Z0-9_-]+)(['"])?:([^\/])/g, '"$2":$4').replace(/'([\s\S]*?)'/g, '"$1"').replace(/,(\s*})/g, "$1"));
            }
            break;
        }
      } else {
        if (ele.constructor.defaultProps && ele.constructor.defaultProps.hasOwnProperty(key)) {
          ele.props[key] = ele.constructor.defaultProps[key];
        } else {
          ele.props[key] = null;
        }
      }
    });
  }
  static get observedAttributes() {
    return this.updateOnAttributeChanged && this.propTypes ? Object.keys(this.propTypes).map(hyphenate) : [];
  }
  attributeChangedCallback(attr, oldVal, newVal) {
    if (this.isInstalled && this._willUpdate !== true && this.updateOnAttributeChanged !== false)
      this.lazyUpdate();
  }
  fire(name, data, cancelable = false, bubbles = false) {
    let customEvent = new CustomEvent(name, {
      detail: data,
      cancelable,
      bubbles
    });
    const handler2 = this.props[`on${capitalize(name)}`];
    if (typeof handler2 === "function") {
      return handler2(customEvent);
    } else {
      return this.dispatchEvent(customEvent);
    }
  }
  $$(selector) {
    return [...(this.shadowRoot ?? this).querySelectorAll(selector)];
  }
  $(selector) {
    return (this.shadowRoot ?? this).querySelector(selector);
  }
  beforeInstall() {
  }
  install() {
  }
  afterInstall() {
  }
  installed() {
  }
  uninstall() {
  }
  beforeUpdate() {
  }
  updated() {
  }
  beforeRender() {
  }
  rendered() {
  }
  receiveProps() {
  }
};

// node_modules/omi-router/src/index.ts
var import_path_to_regexp = __toESM(require_path_to_regexp());
var mapping = {};
var root = getGlobal2();
root.route = route;
root.route.params = null;
root.historyLength = 0;
root.route.to = function(path, data) {
  root.route._routeByTo = true;
  root.route.data = data;
  if (path[0] === "#") {
    location.hash = path;
  } else {
    location.hash = "#" + path;
  }
};
window.addEventListener("hashchange", hashChange);
function hashChange(evt) {
  let byNative = false;
  if (window.history.length === root.historyLength && !root.route._routeByTo) {
    byNative = true;
  }
  root.route._routeByTo = false;
  root.historyLength = window.history.length;
  let prevent = false;
  if (root.route.before) {
    prevent = root.route.before(evt) === false;
  }
  if (prevent)
    return;
  let path = window.location.hash.replace("#", "");
  if (path === "")
    path = "/";
  let notFound = true;
  Object.keys(mapping).every(function(key) {
    const toArr = path.split("?")[0].match(mapping[key].reg);
    if (toArr) {
      let pathArr = key.match(mapping[key].reg);
      root.route.params = getParams(toArr, pathArr);
      root.route.query = getUrlParams(path);
      mapping[key].callback({
        params: root.route.params,
        query: getUrlParams(path),
        data: root.route.data,
        byNative
      });
      root.route.data = null;
      notFound = false;
      return false;
    }
    return true;
  });
  if (notFound) {
    mapping["*"] && mapping["*"].callback({ byNative });
  }
  if (root.route.after) {
    root.route.after(evt);
  }
}
document.addEventListener("DOMContentLoaded", hashChange);
function getParams(toArr, pathArr) {
  const params = {};
  toArr.forEach(function(item, index) {
    if (index > 0) {
      params[pathArr[index].replace(":", "")] = item;
    }
  });
  return params;
}
function route(path, callback) {
  mapping[path] = {
    callback,
    reg: (0, import_path_to_regexp.default)(path)
  };
}
function getGlobal2() {
  if (typeof global !== "object" || !global || global.Math !== Math || global.Array !== Array) {
    return self || window || global || function() {
      return this;
    }();
  }
  return global;
}
function getUrlParams(url) {
  url = url.replace(/#.*$/, "");
  let queryArray = url.split(/[?&]/).slice(1);
  let i, args = {};
  for (i = 0; i < queryArray.length; i++) {
    let match = queryArray[i].match(/([^=]+)=([^=]+)/);
    if (match !== null) {
      args[match[1]] = decodeURIComponent(match[2]);
    }
  }
  return args;
}

// src/uniqueTag.js
var classTagMap = /* @__PURE__ */ new Map();
var prefixMap = /* @__PURE__ */ new Map();
function uniqueTag_default(componentClass, tagPrefix = "oi-part") {
  if (classTagMap.has(componentClass)) {
    return classTagMap.get(componentClass);
  }
  let index = prefixMap.get(tagPrefix) ?? 1;
  let tag2 = `${tagPrefix}-${index + 1}`;
  define(tag2, componentClass);
  prefixMap.set(tagPrefix, ++index);
  classTagMap.set(componentClass, tag2);
  return tag2;
}

// node_modules/observing/src/symbols.js
var proxySymbol = Symbol("observing-proxy");
var getSymbol = Symbol("proxy-get");
var setSymbol = Symbol("proxy-set");
var delSymbol = Symbol("proxy-del");
var wellKnownSymbols = Object.getOwnPropertyNames(Symbol).map((key) => Symbol[key]).filter((value) => typeof value === "symbol");

// node_modules/observing/src/proxies.js
var proxyMap = /* @__PURE__ */ new WeakMap();
var rawMap = /* @__PURE__ */ new WeakMap();
function getProxy(o2) {
  return proxyMap.get(o2) ?? {};
}
function setProxy(o2, { proxy, handler: handler2 }) {
  proxyMap.set(o2, { proxy, handler: handler2 });
  rawMap.set(proxy, { raw: o2, handler: handler2 });
}
function getRaw(proxy) {
  return rawMap.get(proxy) ?? {};
}

// node_modules/observing/src/callbacks.js
var callbackMap = /* @__PURE__ */ new WeakMap();
function addCallbackSet(cb, set2) {
  let arr = callbackMap.get(cb);
  if (arr === void 0) {
    arr = [];
    callbackMap.set(cb, arr);
  }
  arr.push(set2);
}
function getCallbackSets(cb) {
  return callbackMap.get(cb) ?? [];
}

// node_modules/observing/src/handler.js
var Handler = class {
  #action = getSymbol;
  #path;
  #callbacks;
  constructor(...callbacks) {
    this.#callbacks = /* @__PURE__ */ new Set();
    this.addCallbacks(...callbacks);
  }
  get callbacks() {
    return this.#callbacks;
  }
  addCallbacks(...callbacks) {
    callbacks.forEach((cb) => {
      if (!this.#callbacks.has(cb)) {
        this.#callbacks.add(cb);
        addCallbackSet(cb, this.#callbacks);
      }
    });
  }
  doCallbacks({ path, oldVal, val }) {
    this.#callbacks.forEach((callback) => {
      callback({ path, oldVal, val });
    });
  }
  deleteProperty(target, property) {
    const result = Reflect.deleteProperty(target, property);
    this.#action = delSymbol;
    return result;
  }
  get(target, property, receiver) {
    this.#action = getSymbol;
    if (property === proxySymbol) {
      return true;
    }
    if (property === "addCallbacks") {
      return this.addCallbacks.bind(this);
    }
    const result = Reflect.get(target, property, receiver);
    if (typeof property === "symbol" && wellKnownSymbols.includes(property)) {
      return result;
    }
    if (!this.#path)
      this.#path = /* @__PURE__ */ new Set();
    Promise.resolve().then(() => {
      this.#path = null;
    });
    if (target instanceof Array === false) {
      this.#path.add(property);
    }
    if (typeof result === "object") {
      let { proxy, handler: handler2 } = getProxy(result);
      if (proxy === void 0) {
        handler2 = new Handler(...this.#callbacks);
        proxy = new Proxy(result, handler2);
        setProxy(result, { proxy, handler: handler2 });
      } else {
        handler2.addCallbacks(...this.#callbacks);
      }
      handler2.#path = this.#path;
      return proxy;
    }
    return result;
  }
  set(target, property, value, receiver) {
    const oldVal = Reflect.get(target, property, receiver);
    const result = Reflect.set(target, property, value, receiver);
    if (!(target instanceof Array && property === "length" && this.#action !== delSymbol)) {
      if (!this.#path)
        this.#path = /* @__PURE__ */ new Set();
      Promise.resolve().then(() => {
        this.#path = null;
      });
      this.#path.add(property);
      this.doCallbacks({ path: [...this.#path], oldVal, val: value });
    }
    this.#action = setSymbol;
    return result;
  }
};

// node_modules/observing/src/index.js
function observe(o2 = {}, ...callbacks) {
  if (typeof o2 !== "object") {
    console.error("observe need a object");
  }
  if (o2[proxySymbol] === true) {
    const { handler: handler3 } = getRaw(o2);
    if (handler3) {
      handler3.addCallbacks(...callbacks);
    }
    return o2;
  }
  let { proxy, handler: handler2 } = getProxy(o2);
  if (handler2) {
    handler2.addCallbacks(...callbacks);
  } else {
    const _handler = new Handler(...callbacks);
    proxy = new Proxy(o2, _handler);
    setProxy(o2, { proxy, handler: _handler });
  }
  return proxy;
}
function unobserve(o2, ...callbacks) {
  if (typeof o2 === "function") {
    callbacks.unshift(o2);
  }
  if (callbacks.length === 0) {
    const { handler: handler2 } = o2[proxySymbol] === true ? getRaw(o2) : getProxy(o2);
    callbacks = (handler2 && handler2.callbacks) ?? [];
  }
  callbacks.forEach((cb) => {
    const sets = getCallbackSets(cb);
    sets.forEach((set2) => {
      set2.delete(cb);
    });
  });
}

// node_modules/omi-binding/src/index.js
var BINDING_HANDLERS = [];
var addBindingHandler = (handler2) => {
  BINDING_HANDLERS.push(handler2);
};
var updateSelect = (el, path, scope) => {
  let val = get(scope, path);
  if (val === false || val === null || val === void 0) {
    val = "";
  }
  el.value = val.toString();
};
addBindingHandler((el, path, scope) => {
  if (el.nodeName === "SELECT") {
    unbind(el, "change");
    bind(el, "change", () => {
      set(scope, path, el.value);
    });
    return updateSelect;
  }
});
var updateRadio = (el, path, scope) => {
  el.checked = get(scope, path) === el.value;
};
addBindingHandler((el, path, scope) => {
  if (el.type === "radio" && el.nodeName == "INPUT") {
    unbind(el, "change");
    bind(el, "change", () => {
      set(scope, path, el.value);
    });
    return updateRadio;
  }
});
var updateCheckbox = (el, path, scope) => {
  const tureVal = el.getAttribute("o-true-value") || true;
  let value = get(scope, path);
  if (value instanceof Array) {
    el.checked = value.includes(el.value);
  } else {
    el.checked = value === tureVal;
  }
};
addBindingHandler((el, path, scope) => {
  if (el.type === "checkbox" && el.nodeName == "INPUT") {
    const tureVal = el.getAttribute("o-true-value") || true;
    const falseVal = el.getAttribute("o-false-value") || false;
    unbind(el, "change");
    bind(el, "change", () => {
      let value = get(scope, path);
      if (value instanceof Array) {
        let valSet = new Set(value);
        if (el.checked) {
          valSet.add(el.value);
        } else {
          valSet.delete(el.value);
        }
        value.splice(0, value.length, ...valSet);
      } else {
        set(scope, path, el.checked ? tureVal : falseVal);
      }
    });
    return updateCheckbox;
  }
});
var updateInput = (el, path, scope) => {
  el.value = get(scope, path) || "";
};
addBindingHandler((el, path, scope) => {
  if (el.nodeName == "INPUT") {
    let filter = el.getAttribute("filter");
    if (filter) {
      let reg = new RegExp(filter);
      unbind(el, "keypress");
      bind(el, "keypress", (evt) => {
        if (!reg.test(evt.key)) {
          evt.preventDefault();
        }
      });
    }
    unbind(el, "input");
    bind(el, "input", (evt) => {
      set(scope, path, el.value);
    });
    return updateInput;
  }
});
extend2("model", (el, path, scope) => {
  let raw = scope;
  scope = scope.bindingScope ?? scope.props?.bindingScope ?? scope;
  if (scope === false) {
    raw = scope = window;
  }
  let bindings = raw.__bindings ?? (raw.__bindings = []);
  Promise.resolve().then(() => {
    for (let handler2 of BINDING_HANDLERS) {
      let updateFunction = handler2(el, path, scope);
      if (typeof updateFunction === "function") {
        bindings.push({
          element: el,
          path,
          updateFunction
        });
        updateFunction(el, path, scope);
        break;
      }
    }
  });
  if (!raw.hasOwnProperty("updateBindings")) {
    raw.updateBindings = () => {
      for (let binding of bindings) {
        binding.updateFunction(binding.element, binding.path, scope);
      }
    };
  }
});

// src/omii.js
var html = htm_module_default.bind(h);
var version = "1.0.3";
var omii = options_default.root.omii = { ...options_default.root.omi, version, Component: component_default, route, apis: src_default, html, uniqueTag: uniqueTag_default, updateTargets, throttle, debounce, setTheme, purgeCSS, purgeCSSSS, observe, unobserve };
var omii_default = omii;
export {
  $,
  component_default as Component,
  WeElement,
  src_default as apis,
  bind,
  classNames,
  cloneElement,
  h as createElement,
  createRef,
  debounce,
  omii_default as default,
  define,
  defineElement,
  elements,
  extend2 as extend,
  extractClass,
  get,
  getHost,
  h,
  html,
  o,
  observe,
  options_default as options,
  purgeCSS,
  purgeCSSSS,
  render,
  route,
  rpx,
  set,
  setTheme,
  tag,
  throttle,
  unbind,
  uniqueTag_default as uniqueTag,
  unobserve,
  updateTargets
};
/*!
 *  omi-router v3.0.1 by dntzhang
 *  Router for Omi.
 *  Github: https://github.com/Tencent/omi
 *  MIT Licensed.
 */
/*!
 * weakmap-polyfill v2.0.4 - ECMAScript6 WeakMap polyfill
 * https://github.com/polygonplanet/weakmap-polyfill
 * Copyright (c) 2015-2021 polygonplanet <polygon.planet.aqua@gmail.com>
 * @license MIT
 */
/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
//# sourceMappingURL=omii.js.map
