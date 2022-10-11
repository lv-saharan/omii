import { define } from "./define"
const classTagMap = new Map()
const prefixMap = new Map()

export default function (componentClass, tagPrefix = "oi-part") {
    if (classTagMap.has(componentClass)) {
        return classTagMap.get(componentClass)
    }

    let index = prefixMap.get(tagPrefix) ?? 1
    let tag = `${tagPrefix}-${index + 1}`
    define(tag, componentClass)
    prefixMap.set(tagPrefix, ++index)
    classTagMap.set(componentClass, tag)
    return tag
}