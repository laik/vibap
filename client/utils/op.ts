export function not(a: string[], b: string[]) {
    if (!a || a.length === 0) return !b ? [] : b;
    if (!b || b.length === 0) return !a ? [] : a;
    return a.filter(value => b.indexOf(value) === -1);
}

export function intersection(a: string[], b: string[]) {
    return a.filter(value => b.indexOf(value) !== -1);
}

export function union(a: string[], b: string[]) {
    return [...a, ...not(b, a)];
}