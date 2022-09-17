const createStyleSheet = (href) => {
    let link = document.createElement("link");
    link.setAttribute("href", href);
    link.setAttribute("rel", "stylesheet");
    return link;
};
const createStyleSheets = (hrefs) => {
    return hrefs.map(createStyleSheet);
};

const purgeCSSSS = async (css, owner) => {
    return purgeCSS(css, owner, true)
}
const cssFuncMap = new WeakMap()

const purgeCSS = async (css, owner, buildCSSStyleSheet = false) => {
    const cssss = []
    const stack = [css]
    while (stack.length) {
        let _css = stack.shift()
        if (_css instanceof Promise) {
            _css = await _css
        }
        if (!_css) continue

        if (typeof _css == "function") {
            let funcCSS = cssFuncMap.get(_css)
            if (typeof funcCSS === "undefined") {
                cssFuncMap.set(_css, funcCSS = [])
                funcCSS.__f__ = true
                //执行一次？
                const result = _css.call(owner)
                //执行的快慢都有可能
                cssFuncMap.set(_css, result)
                stack.unshift(result)
                continue
            } else if (funcCSS instanceof Array && funcCSS.__f__ === true) {
                //多线程！
                stack.unshift(new Promise((resolve) => {
                    funcCSS.push(resolve);
                }))
                continue
            }
            stack.unshift(funcCSS)

        }
        if (_css instanceof Array) {
            stack.unshift(..._css)
            continue
        }

        if (_css.default) {
            stack.unshift(_css.default)
            continue
        }

        if (typeof _css === 'string') {
            if (buildCSSStyleSheet === false) {
                cssss.push(_css)
                continue
            }
            let styleSheet = new CSSStyleSheet()
            styleSheet.replaceSync(_css)
            cssss.push(styleSheet)
        }
        if (_css instanceof CSSStyleSheet) {
            cssss.push(_css)
        }

    }
    return cssss
}

export { createStyleSheet, createStyleSheets, purgeCSSSS, purgeCSS }