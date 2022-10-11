import {
    tag,
    WeElement,
    render,
    h,
    createElement,
    options,
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
    extend,
    get,
    set,
    bind,
    unbind
} from './omi'

import apis from "dynamic-apis"

import htm from 'htm'

const html = htm.bind(h)

import Component from './component'

import { route } from 'omi-router/src'

import uniqueTag from './uniqueTag'

import { updateTargets } from './updateTargets'

import { throttle, debounce } from 'throttle-debounce'

import { setTheme } from './theme'

import { purgeCSSSS, purgeCSS } from './stylesheet'

import { observe, unobserve } from "observing"

import './binding'
export {
    tag,
    WeElement,
    Component,
    render,
    h,
    createElement,
    options,
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
    extend,
    get,
    set,
    bind,
    unbind,
    route,
    apis,
    html,
    uniqueTag,
    updateTargets,
    throttle,
    debounce,
    setTheme,
    purgeCSS,
    purgeCSSSS, observe, unobserve
}
const version = "1.0.12"
const omii = options.root.omii = { ...options.root.omi, version, Component, route, apis, html, uniqueTag, updateTargets, throttle, debounce, setTheme, purgeCSS, purgeCSSSS, observe, unobserve }
export default omii

