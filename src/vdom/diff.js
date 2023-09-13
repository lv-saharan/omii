import { ATTR_KEY } from "../constants";
import { isSameNodeType, isNamedNode } from "./index";
import { createNode, setAccessor, removeNode } from "../dom/index";
import { camelCase, isArray, Fragment } from "../util";
import options from "../options";

/** Queue of components that have been mounted and are awaiting componentDidMount */
export const mounts = [];

/** Diff recursion count, used to track the end of the diff cycle. */
export let diffLevel = 0;

// /** Global flag indicating if the diff is currently within an SVG */
// let isSvgMode = false

// /** Global flag indicating if the diff is performing hydration */
// let hydrating = false

/** convert  vnode  function to object */
const purgeVNode = (vnode, args) => {
  if (
    vnode === null ||
    vnode === undefined ||
    (typeof vnode !== "function" && typeof vnode.nodeName !== "function")
  )
    return vnode;
  const vnodeName = vnode.nodeName;

  if (typeof vnodeName === "function") {
    for (let key in options.mapping) {
      if (options.mapping[key] === vnodeName) {
        vnode.nodeName = key;
        return vnode;
      }
    }
  }

  args.vnode = vnode;
  args.update = (updateSelf) => {
    return diff(
      args.dom,
      args.vnode,
      args.dom && args.dom.parentNode,
      args.component,
      updateSelf
    );
  };

  //not found component
  if (typeof vnodeName === "function") {
    const { children, attributes } = vnode;
    args.children = children;
    vnode = vnodeName(attributes, args);
  } else {
    vnode = vnode(args);
  }

  if (vnode instanceof Array) {
    //wrap
    vnode = {
      nodeName: "output",
      children: vnode,
    };
  }
  if (
    vnode === null ||
    vnode === undefined ||
    !vnode.hasOwnProperty("nodeName")
  ) {
    vnode = {
      nodeName: "output",
      children: [vnode],
    };
  }
  vnode.setDom = (dom) => {
    if (dom) {
      args.dom = dom;
      Promise.resolve().then(() => {
        dom.dispatchEvent(
          new CustomEvent("updated", {
            detail: args,
            cancelable: true,
            bubbles: true,
          })
        );
      });
      if (!dom.update) dom.update = args.update;
    }
  };
  return vnode;
};

/** Apply differences in a given vnode (and it's deep children) to a real DOM Node.
 *  @param {Element} [dom=null]    A DOM node to mutate into the shape of the `vnode`
 *  @param {VNode} vnode      A VNode (with descendants forming a tree) representing the desired DOM structure
 *  @returns {Element} dom      The created/mutated element
 *  @private
 */
export async function diff(dom, vnode, parent, component, updateSelf) {
  // first render return undefined
  if (!dom && !vnode) return;
  // diffLevel having been 0 here indicates initial entry into the diff (not a subdiff)

  //diff应该是上下文的
  const diffContext = {
    hydrating: dom != null && !(ATTR_KEY in dom),
    isSvgMode: parent != null && parent.ownerSVGElement !== undefined,
  };

  let ret;
  // if (!diffLevel++) {
  //   // when first starting the diff, check if we're diffing an SVG or within an SVG
  //   isSvgMode = parent != null && parent.ownerSVGElement !== undefined

  //   // hydration is indicated by the existing element to be diffed not having a prop cache
  //   hydrating = dom != null && !(ATTR_KEY in dom)
  // }
  //dynamic vnode
  vnode = purgeVNode(vnode, { component });
  //////////////////////////////////////////////////////////////////////

  if (vnode && vnode.nodeName === Fragment) {
    vnode = vnode.children;
  }
  if (isArray(vnode)) {
    //dynamic vnode
    vnode = vnode.map((child) => purgeVNode(child, { component }));
    //////////////////////////////////////////////////////////////////////

    if (parent) {
      // don't use css and props.css when using h.f
      // diff node list and vnode list
      await innerDiffNode(
        parent,
        vnode,
        diffContext.hydrating,
        component,
        updateSelf,
        diffContext
      );
    } else {
      // connectedCallback 的时候 parent 为 null
      ret = [];
      for (let index = 0; index < vnode.length; index++) {
        const item = vnode[index];
        let ele = await idiff(
          index === 0 ? dom : null,
          item,
          component,
          updateSelf,
          diffContext
        );
        ret.push(ele);
      }
      // vnode.forEach(async (item, index) => {
      //   let ele = await idiff(index === 0 ? dom : null, item, component, updateSelf)
      //   // 返回数组的情况下，在 WeElement 中进行了 shadowRoot.appendChild
      //   // 所有不会出现 vnode index 大于 0 丢失的情况
      //   ret.push(ele)
      // })
    }
  } else {
    if (isArray(dom)) {
      for (let index = 0; index < dom.length; index++) {
        const one = dom[index];
        if (index === 0) {
          ret = await idiff(one, vnode, component, updateSelf, diffContext);
        } else {
          recollectNodeTree(one, false);
        }
      }
      // dom.forEach(async (one, index) => {
      //   if (index === 0) {
      //     ret = await idiff(one, vnode, component, updateSelf)
      //   } else {
      //     recollectNodeTree(one, false)
      //   }
      // })
    } else {
      ret = await idiff(dom, vnode, component, updateSelf, diffContext);
    }
    // append the element if its a new parent
    if (parent && ret.parentNode !== parent) parent.appendChild(ret);
  }

  // diffLevel being reduced to 0 means we're exiting the diff
  // if (!--diffLevel) {
  //   hydrating = false
  //   // invoke queued componentDidMount lifecycle methods
  // }
  return ret;
}

/** Internals of `diff()`, separated to allow bypassing diffLevel / mount flushing. */
async function idiff(dom, vnode, component, updateSelf, diffContext) {
  if (dom && vnode && dom.props) {
    dom.props.children = vnode.children;
  }
  let out = dom,
    prevSvgMode = diffContext.isSvgMode;

  // empty values (null, undefined, booleans) render as empty Text nodes
  if (vnode == null || typeof vnode === "boolean") vnode = "";

  // Fast case: Strings & Numbers create/update Text nodes.
  if (typeof vnode === "string" || typeof vnode === "number") {
    // update if it's already a Text node:
    if (
      dom &&
      dom.splitText !== undefined &&
      dom.parentNode &&
      (!dom._component || component)
    ) {
      /* istanbul ignore if */ /* Browser quirk that can't be covered: https://github.com/developit/preact/commit/fd4f21f5c45dfd75151bd27b4c217d8003aa5eb9 */
      if (dom.nodeValue != vnode) {
        dom.nodeValue = vnode;
      }
    } else {
      // it wasn't a Text node: replace it with one and recycle the old Element
      out = document.createTextNode(vnode);
      if (dom) {
        if (dom.parentNode) dom.parentNode.replaceChild(out, dom);
        recollectNodeTree(dom, true);
      }
    }

    out[ATTR_KEY] = true;
    //dynamic vnode
    vnode.setDom && vnode.setDom(out);
    /////////////////////////////////////////////////////////
    return out;
  }

  // If the VNode represents a Component, perform a component diff:
  let vnodeName = vnode.nodeName;

  // Tracks entering and exiting SVG namespace when descending through the tree.
  diffContext.isSvgMode =
    vnodeName === "svg"
      ? true
      : vnodeName === "foreignObject"
      ? false
      : diffContext.isSvgMode;

  // If there's no existing element or it's the wrong type, create a new one:
  vnodeName = String(vnodeName);
  if (!dom || !isNamedNode(dom, vnodeName)) {
    out = createNode(
      vnodeName,
      diffContext.isSvgMode,
      vnode.attributes && vnode.attributes.is && { is: vnode.attributes.is }
    );

    if (dom) {
      // move children into the replacement node
      while (dom.firstChild) out.appendChild(dom.firstChild);

      // if the previous Element was mounted into the DOM, replace it inline
      if (dom.parentNode) dom.parentNode.replaceChild(out, dom);

      // recycle the old element (skips non-Element node types)
      recollectNodeTree(dom, true);
    }
  }

  let fc = out.firstChild,
    props = out[ATTR_KEY],
    vchildren = vnode.children;

  //dynamic vnode
  vchildren = vnode.children.map((child) => purgeVNode(child, { component }));
  /////////////////////////////////////////////////////////

  if (props == null) {
    props = out[ATTR_KEY] = {};
    for (let a = out.attributes, i = a.length; i--; )
      props[a[i].name] = a[i].value;
  }

  // Optimization: fast-path for elements containing a single TextNode:
  if (
    !diffContext.hydrating &&
    vchildren &&
    vchildren.length === 1 &&
    typeof vchildren[0] === "string" &&
    fc != null &&
    fc.splitText !== undefined &&
    fc.nextSibling == null
  ) {
    if (fc.nodeValue != vchildren[0]) {
      fc.nodeValue = vchildren[0];
    }
  }
  // otherwise, if there are existing or new children, diff them:
  else if ((vchildren && vchildren.length) || fc != null) {
    if (!(out.constructor.is == "WeElement" && out.constructor.noSlot)) {
      await innerDiffNode(
        out,
        vchildren,
        diffContext.hydrating ||
          props.unsafeHTML != null ||
          props.dangerouslySetInnerHTML != null,
        component,
        updateSelf,
        diffContext
      );
    }
  }

  // Apply attributes/props from VNode to the DOM Element:
  await diffAttributes(
    out,
    vnode.attributes,
    props,
    component,
    updateSelf,
    diffContext
  );
  if (out.props) {
    out.props.children = vnode.children;
  }
  // restore previous SVG mode: (in case we're exiting an SVG namespace)
  diffContext.isSvgMode = prevSvgMode;
  //dynamic vnode
  vnode.setDom && vnode.setDom(out);
  /////////////////////////////////////////////////////////
  return out;
}

/** Apply child and attribute changes between a VNode and a DOM Node to the DOM.
 *  @param {Element} dom      Element whose children should be compared & mutated
 *  @param {Array} vchildren    Array of VNodes to compare to `dom.childNodes`
 *  @param {Boolean} isHydrating  If `true`, consumes externally created elements similar to hydration
 */
async function innerDiffNode(
  dom,
  vchildren,
  isHydrating,
  component,
  updateSelf,
  diffContext
) {
  let originalChildren = dom.childNodes,
    children = [],
    keyed = {},
    keyedLen = 0,
    min = 0,
    len = originalChildren.length,
    childrenLen = 0,
    vlen = vchildren ? vchildren.length : 0,
    j,
    c,
    f,
    vchild,
    child;

  // Build up a map of keyed children and an Array of unkeyed children:
  if (len !== 0) {
    for (let i = 0; i < len; i++) {
      let child = originalChildren[i],
        props = child[ATTR_KEY],
        key =
          vlen && props
            ? child._component
              ? child._component.__key
              : props.key
            : null;
      if (key != null) {
        keyedLen++;
        keyed[key] = child;
      } else if (
        props ||
        (child.splitText !== undefined
          ? isHydrating
            ? child.nodeValue.trim()
            : true
          : isHydrating)
      ) {
        children[childrenLen++] = child;
      }
    }
  }

  if (vlen !== 0) {
    for (let i = 0; i < vlen; i++) {
      vchild = vchildren[i];

      child = null;

      if (vchild) {
        // attempt to find a node based on key matching
        let key = vchild.key;
        if (key != null) {
          if (keyedLen && keyed[key] !== undefined) {
            child = keyed[key];
            keyed[key] = undefined;
            keyedLen--;
          }
        }
        // attempt to pluck a node of the same type from the existing children
        else if (!child && min < childrenLen) {
          for (j = min; j < childrenLen; j++) {
            if (
              children[j] !== undefined &&
              isSameNodeType((c = children[j]), vchild, isHydrating)
            ) {
              child = c;
              children[j] = undefined;
              if (j === childrenLen - 1) childrenLen--;
              if (j === min) min++;
              break;
            }
          }
        }
      }

      // morph the matched/found/created DOM child to match vchild (deep)
      child = await idiff(child, vchild, component, updateSelf, diffContext);

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

  // remove unused keyed children:
  if (keyedLen) {
    for (let i in keyed)
      if (keyed[i] !== undefined) recollectNodeTree(keyed[i], false);
  }

  // remove orphaned unkeyed children:
  while (min <= childrenLen) {
    if ((child = children[childrenLen--]) !== undefined)
      recollectNodeTree(child, false);
  }
}

/** Recursively recycle (or just unmount) a node and its descendants.
 *  @param {Node} node            DOM node to start unmount/removal from
 *  @param {Boolean} [unmountOnly=false]  If `true`, only triggers unmount lifecycle, skips removal
 */
export function recollectNodeTree(node, unmountOnly) {
  // If the node's VNode had a ref function, invoke it with null here.
  // (this is part of the React spec, and smart for unsetting references)
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

/** Recollect/unmount all children.
 *  - we use .lastChild here because it causes less reflow than .firstChild
 *  - it's also cheaper than accessing the .childNodes Live NodeList
 */
export function removeChildren(node) {
  node = node.lastChild;
  while (node) {
    let next = node.previousSibling;
    recollectNodeTree(node, true);
    node = next;
  }
}

/** Apply differences in attributes from a VNode to the given DOM Element.
 *  @param {Element} dom    Element with attributes to diff `attrs` against
 *  @param {Object} attrs    The desired end-state key-value attribute pairs
 *  @param {Object} old      Current/previous attributes (from previous VNode or element's prop cache)
 */
async function diffAttributes(
  dom,
  attrs,
  old,
  component,
  updateSelf,
  { isSvgMode }
) {
  let name;
  //let update = false
  let isWeElement = dom.update;
  let oldClone;
  if (dom.receiveProps) {
    oldClone = Object.assign({}, old);
  }
  // remove attributes no longer present on the vnode by setting them to undefined
  for (name in old) {
    if (!(attrs && attrs[name] != null) && old[name] != null) {
      setAccessor(
        dom,
        name,
        old[name],
        (old[name] = undefined),
        isSvgMode,
        component
      );
      if (isWeElement) {
        delete dom.props[name];
        //update = true
      }
    }
  }

  // add new & update changed attributes
  for (name in attrs) {
    if (isWeElement && typeof attrs[name] === "object" && name !== "ref") {
      if (name === "style") {
        setAccessor(
          dom,
          name,
          old[name],
          (old[name] = attrs[name]),
          isSvgMode,
          component
        );
      }
      let ccName = camelCase(name);
      dom.props[ccName] = old[ccName] = attrs[name];
      //update = true
    } else if (
      name !== "children" &&
      (!(name in old) ||
        attrs[name] !==
          (name === "value" || name === "checked" ? dom[name] : old[name]))
    ) {
      setAccessor(dom, name, old[name], attrs[name], isSvgMode, component);
      //fix lazy load props missing
      if (dom.nodeName.indexOf("-") !== -1) {
        dom.props = dom.props || {};
        let ccName = camelCase(name);
        dom.props[ccName] = old[ccName] = attrs[name];
        //update = true
      } else {
        old[name] = attrs[name];
      }
    }
  }

  if (isWeElement && !updateSelf && dom.parentNode && dom.receiveProps) {
    //__hasChildren is not accuracy when it was empty at first, so add dom.children.length > 0 condition
    //if (update || dom.__hasChildren || dom.children.length > 0 || (dom.store && !dom.store.data)) {
    if (dom.receiveProps(dom.props, oldClone) !== false) {
      await dom.update();
    }
    //}
  }
}
