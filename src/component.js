import { isArray, capitalize, hyphenate } from 'omi/src/util'
import { diff } from 'omi/src/vdom/diff'
import { WeElement, options, getHost } from 'omi/src/omi'
import { createStyleSheets, createStyleSheet, purgeCSSSS, purgeCSS } from './stylesheet'
import { updateTargets } from './updateTargets'
import { throttle } from 'throttle-debounce'
import themeCSSStyleSheet from './theme'
const UpdateInterval = 13
const adoptedStyleSheetsMap = new WeakMap()
// const chromeMatch = navigator.userAgent.match(/Chrome\/(\d+)/)
// const chromeVersion = Number.parseInt(chromeMatch && chromeMatch[1])
// console.log(chromeVersion, "如果小于99，adoptedStylesheets需要用数组赋值")
//小程序目前也只支持adoptedStylesheets数组赋值
export default class extends WeElement {
    #store = null
    get store() {
        if (this.#store) return this.#store
        let p = this.parentNode
        //need test getrootnode
        while (p && !p.store) {
            p = p.parentNode || p.host
        }
        if (p) this.#store = p.store
        // //子节点就不用再遍历到document了
        else this.#store = {}
        return this.#store
    }
    set store(value) {
        this.#store = value
    }

    #injection = null
    get injection() {
        if (this.#injection) return this.#injection
        if (this.inject) {
            this.#injection = {}
            let p = this.parentNode
            let provide
            while (p && !provide) {
                provide = p.provide
                p = p.parentNode || p.host
            }
            if (provide) {
                this.inject.forEach(injectKey => {
                    this.injection[injectKey] = provide[injectKey]
                })
            } else {
                throw 'The provide prop was not found on the parent node or the provide type is incorrect.'
            }
        }
    }

    async connectedCallback() {
        this.attrsToProps()

        //props 中如果是非object类型在update过程中会引起值的回退
        //增加props 绑定可以将需要保持状态的值封装成对象传值
        let $props = this.props.props
        if ($props && typeof $props === "object") {
            this.$props = $props
            for (let pp in this.props) {
                if (pp !== "props" && pp !== "children" && !$props.hasOwnProperty(pp)) {
                    $props[pp] = this.props[pp]
                }
            }
        } else {
            this.$props = this.props
        }

        let shadowRoot
        if (this.constructor.isLightDom) {
            shadowRoot = this
        } else {
            if (!this.shadowRoot) {
                shadowRoot = this.attachShadow({
                    mode: 'open'
                })
            } else {
                shadowRoot = this.shadowRoot
                let fc
                while ((fc = shadowRoot.firstChild)) {
                    shadowRoot.removeChild(fc)
                }
            }
        }
        await this.beforeInstall()
        await this.install()
        await this.afterInstall()
        await this.beforeRender()
        options.afterInstall && await options.afterInstall(this)
        const rendered = await this.render(this.props, this.store)
        await this.rendered()
        this.rootNode = diff(null, rendered, null, this)
        if (isArray(this.rootNode)) {
            this.rootNode.forEach(function (item) {
                shadowRoot.appendChild(item)
            })
        } else {
            this.rootNode && shadowRoot.appendChild(this.rootNode)
        }
        await this.#initStyle()
        await this.installed()
        this.isInstalled = true
        this.fire("installed")
    }
    async disconnectedCallback() {
        await this.uninstall()
        this.isInstalled = false
    }
    #css = {
        default_css_content: null,
        default_cssstylesheet: new CSSStyleSheet(),
        props_css_content: null,
        props_cssstylesheet: new CSSStyleSheet(),
        csssses: [],
        stylesheetMap: new Map(),
        theme_css: null,
        theme_cssstylesheet: new CSSStyleSheet(),
    }
    //性能应该没有多大影响，会使updateStyles 插入时splice index+2
    get themeCSSStyleSheet() {
        if (!this.$props.themeCss) {
            let host = getHost(this)
            if (!host) {
                return this.#css.theme_cssstylesheet
            }
            return host.themeCSSStyleSheet
        } else {

            if (this.$props.themeCss instanceof CSSStyleSheet) {
                return this.$props.themeCss
            }

            if (this.$props.themeCss != this.#css.theme_css) {
                this.#css.theme_css = this.$props.themeCss
                this.#css.theme_cssstylesheet.replace(this.#css.theme_css)
            }
            return this.#css.theme_cssstylesheet
        }


    }
    async #initStyle() {
        if (this.constructor.isLightDom !== true) {
            let cssss = adoptedStyleSheetsMap.get(this.constructor)
            if (cssss === undefined) {
                let resolves = []
                resolves.__r__ = true
                adoptedStyleSheetsMap.set(this.constructor, resolves)
                cssss = await purgeCSSSS(this.constructor.css, this)
                adoptedStyleSheetsMap.set(this.constructor, cssss)
                resolves.forEach(resolve => {
                    resolve(cssss)
                })
            } else if (cssss instanceof Array && cssss.__r__) {
                let resolves = cssss
                cssss = await new Promise(resolve => {
                    resolves.push(resolve)
                })
            }
            this.shadowRoot.adoptedStyleSheets = [...cssss, this.#css.default_cssstylesheet, this.#css.props_cssstylesheet, this.themeCSSStyleSheet, themeCSSStyleSheet]
            //需要使用同步模式，不然组件有可能会“抖动”
            createStyleSheets(await purgeCSS(this.constructor.stylesheets, this)).forEach((link) => {
                this.shadowRoot.appendChild(link);
            });
        }
        await this.updateStyle()
    }
    // #default_css_content
    // #default_cssstylesheet = new CSSStyleSheet()
    // #props_css_content
    // #props_cssstylesheet = new CSSStyleSheet()
    // #csssses = []
    // #stylesheetMap = new Map()
    /**
     * static css,static stylesheets,this.css,this.stylesheets支持复杂的层次嵌套，函数，数组，可以是字符，CSSStyleSheet
     * this.props.css 只支持字符串
     * this.props.stylesheets支持字符串或字符串数组
     * 
     */
    async updateStyle() {
        if (this.constructor.isLightDom === true) return
        if (this.css) {
            const css_content = (await purgeCSS(this.css, this)).join('\n')
            if (this.#css.default_css_content != css_content) {
                this.#css.default_css_content = css_content
                this.#css.default_cssstylesheet.replaceSync(css_content)
            }
        }

        if (typeof this.props.css == "string") {
            if (this.#css.props_css_content != this.props.css) {
                this.#css.props_css_content = this.props.css
                this.#css.props_cssstylesheet.replaceSync(this.props.css)
            }
        }

        // //CSSStyleSheet
        const csssses = await purgeCSSSS(this.cssss, this)
        csssses.push(... await purgeCSSSS(this.props.cssss, getHost(this)))

        const shadowRoot = this.shadowRoot ?? this

        if (this.#css.csssses.length !== csssses.length || csssses.some((v, index) => v != this.#css.csssses[index])) {
            const adoptedStyleSheets = [...shadowRoot.adoptedStyleSheets]
            adoptedStyleSheets.splice(- (this.#css.csssses.length + 2), this.#css.csssses.length + 1, ...csssses, this.themeCSSStyleSheet)
            shadowRoot.adoptedStyleSheets = adoptedStyleSheets
            this.#css.csssses = csssses
        }


        const stylesheets = await purgeCSS(this.stylesheets, this);
        stylesheets.push(...await purgeCSS(this.props.styleSheets, getHost(this)))

        const stylesheetMap = this.#css.stylesheetMap
        const exsistStylesheets = new Set(stylesheetMap.keys())
        stylesheets.forEach(href => {
            if (!stylesheetMap.has(href)) {
                let stylesheetEle = createStyleSheet(href)
                shadowRoot.appendChild(stylesheetEle);
                stylesheetMap.set(href, stylesheetEle)
            }
            exsistStylesheets.delete(href)
        })
        //need delete link
        exsistStylesheets.forEach(href => {
            const link = stylesheetMap.get(href)
            if (link) {
                shadowRoot.removeChild(link)
                stylesheetMap.delete(href)
            }
        })

        //支持一个样式更新的生命周期
        this.styleUpdated && this.styleUpdated()
        this.fire("styleUpdated")
    }

    /**
     * 更新指定的对象
     * 选择器，数组，元素
     * @param {*} targets 
     */
    updateTargets(targets, ignoreAttrs = true, cascade = true) {
        updateTargets(targets, this.shadowRoot ?? this, ignoreAttrs, cascade)
    }

    async update(ignoreAttrs, updateSelf) {
        if (this._willUpdate === true) return
        this._willUpdate = true
        try {
            await this.beforeUpdate()
            await this.beforeRender()

            this.attrsToProps(ignoreAttrs)
            const rendered = await this.render(this.props, this.store)
            await this.rendered()
            this.rootNode = diff(
                this.rootNode,
                rendered,
                this.constructor.isLightDom ? this : this.shadowRoot,
                this,
                updateSelf
            )
            await this.updateStyle()
        }
        finally {
            this._willUpdate = false
            await this.updated()
        }
    }
    lazyUpdate = throttle(UpdateInterval, (ignoreAttrs, updateSelf) => {
        this.update(ignoreAttrs, updateSelf)
    })

    async forceUpdateSelf() {
        await this.update(true, true)
    }

    update$Props(obj, ignoreAttrs = true, updateSelf = false, updateAttrs = false) {
        Object.keys(obj).forEach(key => {
            let value = obj[key]
            this.$props[key] = value
            if (this.prevProps && this.$props == this.props) {
                this.prevProps[key] = value
            }
            if (updateAttrs) {
                this.pureSetAttribute(key, value)
            }
        })
        this.update(ignoreAttrs, updateSelf)
    }

    attrsToProps(ignoreAttrs) {
        if (ignoreAttrs || this.props.ignoreAttrs) return
        const ele = this
        ele.props['css'] = ele.getAttribute('css')
        const attrs = this.constructor.propTypes
        if (!attrs) return
        Object.keys(attrs).forEach(key => {
            const type = attrs[key]
            const val = ele.getAttribute(hyphenate(key))
            if (val !== null) {
                switch (type) {
                    case String:
                        ele.props[key] = val
                        break
                    case Number:
                        ele.props[key] = Number(val)
                        break
                    case Boolean:
                        if (val === 'false' || val === '0') {
                            ele.props[key] = false
                        } else {
                            ele.props[key] = true
                        }
                        break
                    case Array:
                    case Object:
                        if (val[0] === ':') {
                            ele.props[key] = getValByPath(val.substr(1), Omi.$)
                        } else {
                            ele.props[key] = JSON.parse(
                                val
                                    .replace(/(['"])?([a-zA-Z0-9_-]+)(['"])?:([^\/])/g, '"$2":$4')
                                    .replace(/'([\s\S]*?)'/g, '"$1"')
                                    .replace(/,(\s*})/g, '$1')
                            )
                        }
                        break
                }
            } else {
                if (
                    ele.constructor.defaultProps &&
                    ele.constructor.defaultProps.hasOwnProperty(key)
                ) {
                    ele.props[key] = ele.constructor.defaultProps[key]
                } else {
                    ele.props[key] = null
                }
            }
        })
    }

    /**
     * 默认监控所有定义的属性
     */
    static get observedAttributes() {
        return this.updateOnAttributeChanged && this.propTypes ? Object.keys(this.propTypes).map(hyphenate) : []
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
        })
        const handler = this.props[`on${capitalize(name)}`]
        if (typeof handler === "function") {
            return handler(customEvent)
        } else {
            return this.dispatchEvent(customEvent)
        }
    }


    $$(selector) {
        return [...(this.shadowRoot ?? this).querySelectorAll(selector)];
    }
    $(selector) {
        return (this.shadowRoot ?? this).querySelector(selector);
    }

    beforeInstall() { }

    install() { }

    afterInstall() { }

    installed() { }

    uninstall() { }

    beforeUpdate() { }

    updated() { }

    beforeRender() { }

    rendered() { }

    receiveProps() { }
}
