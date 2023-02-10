import { define } from "./define"
const classTagMap = new Map()
const prefixMap = new Map()

let TagPrefix = "oi-part"

export default function (componentClass, tagPrefix) {
    tagPrefix = tagPrefix ?? TagPrefix
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

export function setTagPrefix(tagPrefix) {
    TagPrefix = tagPrefix
}