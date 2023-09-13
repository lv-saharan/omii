import { cssToDom, isArray, hyphenate, getValByPath, capitalize } from "./util";
import { diff } from "./vdom/diff";
import options from "./options";
import "weakmap-polyfill";

let id = 0;

const adoptedStyleSheetsMap = new WeakMap();
export default class WeElement extends HTMLElement {
  static is = "WeElement";

  constructor() {
    super();
    // fix lazy load props missing
    this.props = Object.assign({}, this.constructor.defaultProps, this.props);
    this.elementId = id++;
    this.computed = {};
    this.isInstalled = false;
  }

  async connectedCallback() {
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

    await this.attrsToProps();

    await this.beforeInstall();
    await this.install();
    await this.afterInstall();

    let shadowRoot;
    if (this.constructor.isLightDom) {
      shadowRoot = this;
    } else {
      if (!this.shadowRoot) {
        shadowRoot = this.attachShadow({
          mode: "open",
        });
      } else {
        shadowRoot = this.shadowRoot;
        let fc;
        while ((fc = shadowRoot.firstChild)) {
          shadowRoot.removeChild(fc);
        }
      }
    }

    if (adoptedStyleSheetsMap.has(this.constructor)) {
      shadowRoot.adoptedStyleSheets = adoptedStyleSheetsMap.get(
        this.constructor
      );
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
          // [object Module]
          const styleSheet = new CSSStyleSheet();
          styleSheet.replaceSync(css.default);
          shadowRoot.adoptedStyleSheets = [styleSheet];
        } else {
          shadowRoot.adoptedStyleSheets = [css];
        }
        adoptedStyleSheetsMap.set(
          this.constructor,
          shadowRoot.adoptedStyleSheets
        );
      }
    }

    await this.beforeRender();
    options.afterInstall && options.afterInstall(this);

    const rendered = await this.render(this.props, this.store);

    this.rootNode = await diff(null, rendered, null, this);
    await this.rendered();

    if (this.css) {
      shadowRoot.appendChild(
        cssToDom(typeof this.css === "function" ? this.css() : this.css)
      );
    }

    if (this.props.css) {
      this._customStyleElement = cssToDom(this.props.css);
      this._customStyleContent = this.props.css;
      shadowRoot.appendChild(this._customStyleElement);
    }

    if (isArray(this.rootNode)) {
      this.rootNode.forEach(function (item) {
        shadowRoot.appendChild(item);
      });
    } else {
      this.rootNode && shadowRoot.appendChild(this.rootNode);
    }
    await this.installed();
    this.isInstalled = true;
  }

  async disconnectedCallback() {
    await this.uninstall();
    this.isInstalled = false;
  }

  async update(ignoreAttrs, updateSelf) {
    this._willUpdate = true;
    await this.beforeUpdate();
    await this.beforeRender();
    //fix null !== undefined
    if (this._customStyleContent != this.props.css) {
      this._customStyleContent = this.props.css;
      if (this._customStyleElement) {
        this._customStyleElement.textContent = this._customStyleContent;
      } else {
        // 当 prop css 开始没有值，后来有值
        this._customStyleElement = cssToDom(this.props.css);
        this.shadowRoot.appendChild(this._customStyleElement);
      }
    }
    this.attrsToProps(ignoreAttrs);

    const rendered = await this.render(this.props, this.store);
    await this.rendered();

    this.rootNode = await diff(
      this.rootNode,
      rendered,
      this.constructor.isLightDom ? this : this.shadowRoot,
      this,
      updateSelf
    );
    this._willUpdate = false;
    await this.updated();
  }

  async forceUpdate() {
    await this.update(true);
  }

  async updateProps(obj) {
    Object.keys(obj).forEach((key) => {
      this.props[key] = obj[key];
      if (this.prevProps) {
        this.prevProps[key] = obj[key];
      }
    });
    await this.forceUpdate();
  }

  async updateSelf(ignoreAttrs) {
    await this.update(ignoreAttrs, true);
  }

  removeAttribute(key) {
    super.removeAttribute(key);
    //Avoid executing removeAttribute methods before connectedCallback
    this.isInstalled && this.update();
  }

  setAttribute(key, val) {
    if (val && typeof val === "object") {
      super.setAttribute(key, JSON.stringify(val));
    } else {
      super.setAttribute(key, val);
    }
    //Avoid executing setAttribute methods before connectedCallback
    this.isInstalled && this.update();
  }

  pureRemoveAttribute(key) {
    super.removeAttribute(key);
  }

  pureSetAttribute(key, val) {
    super.setAttribute(key, val);
  }

  attrsToProps(ignoreAttrs) {
    if (
      ignoreAttrs ||
      (this.store && this.store.ignoreAttrs) ||
      this.props.ignoreAttrs
    )
      return;
    const ele = this;
    ele.props["css"] = ele.getAttribute("css");
    const attrs = this.constructor.propTypes;
    if (!attrs) return;
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
              try {
                ele.props[key] = JSON.parse(val);
              } catch (e) {
                console.warn(
                  `The ${key} object prop does not comply with the JSON specification, the incorrect string is [${val}].`
                );
              }
            }
            break;
        }
      } else {
        if (
          ele.constructor.defaultProps &&
          ele.constructor.defaultProps.hasOwnProperty(key)
        ) {
          ele.props[key] = ele.constructor.defaultProps[key];
        } else {
          ele.props[key] = null;
        }
      }
    });
  }

  fire(name, data) {
    const handler = this.props[`on${capitalize(name)}`];
    if (handler) {
      handler(
        new CustomEvent(name, {
          detail: data,
        })
      );
    } else {
      this.dispatchEvent(
        new CustomEvent(name, {
          detail: data,
        })
      );
    }
  }

  beforeInstall() {}

  install() {}

  afterInstall() {}

  installed() {}

  uninstall() {}

  beforeUpdate() {}

  updated() {}

  beforeRender() {}

  rendered() {}

  receiveProps() {}
}
