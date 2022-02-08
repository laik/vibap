export const nestMapToObject = (map = new Map) => {
    if (!(map instanceof Map)) return map
    return Object.fromEntries(Array.from(map.entries(), ([k, v]) => {
        if (v instanceof Array) {
            return [k, v.map(nestMapToObject)]
        } else if (v instanceof Map) {
            return [k, nestMapToObject(v)]
        } else {
            return [k, v]
        }
    }))
}