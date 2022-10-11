import { elements } from './omi'
function handleTargets(targets, parent) {
    let $targets = []
    if (!targets) return $targets
    if (targets instanceof Array) {
        for (let target of targets) {
            $targets.push(...handleTargets(target, parent))
        }
    } else if (targets instanceof HTMLCollection || targets instanceof NodeList) {
        $targets = [...targets]
    }
    else if (targets instanceof HTMLElement) {
        $targets.push(targets)
    }
    else if (typeof targets === "string") {
        $targets = [...(parent?.querySelectorAll(targets) ?? [])]
    }
    return $targets

}
/**
 * 更新特定组件
 * @param {*} targets HTMLCollection|NodeList
 * @param {Boolean} ignoreAttrs 
 * @param {Boolean} updateSelf 
 */
export function updateTargets(targets, parent = document, ignoreAttrs = false, cascade = true) {
    let $targets = handleTargets(targets, parent)
    let tags = Object.keys(elements);
    let tagsQuery = tags.join(',')
    let updateSelf = !cascade
    for (let $target of $targets) {
        if ('update' in $target) {
            $target.update(ignoreAttrs, updateSelf)
        } else {
            let $chidren = [...$target.querySelectorAll(tagsQuery)]
            for (let $child of $chidren) {
                $child.update(ignoreAttrs, updateSelf)
            }
        }

    }

}

