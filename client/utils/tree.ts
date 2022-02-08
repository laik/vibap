/*
This is a btree node use by tree component
*/
export class XRenderBTree {
    key: string;
    title: string;
    children: XRenderBTree[];

    static addChildToPatent(childKey: string, childTitle: string, patent: XRenderBTree): XRenderBTree {
        const tree = new XRenderBTree([patent.key, childKey].join('.'), childTitle);
        if (!patent.children) patent.children = [];
        patent.addChild(tree);
        return tree;
    }

    static parse(text: string): XRenderBTree {
        return JSON.parse(text) as XRenderBTree;
    }

    childKeys(): string[] {
        return this.children.
            map(child =>
                child.key.slice(child.key.indexOf(this.key) + this.key.length + 1)).
            flat<string[]>();
    }

    constructor(key: string, title: string) {
        this.key = key;
        this.title = title;
        this.children = [];
    }

    addChild(child: XRenderBTree): void {
        if (!this.children) {
            this.children = [];
        }
        this.children.push(child);
    }

    removeChild(child: XRenderBTree): void {
        if (!this.children) {
            return;
        }
        const index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1);
        }
    }

    toObject(): Object {
        return this
    }
}

function example() {
    let root1 = new XRenderBTree('role1', 'role1');
    XRenderBTree.addChildToPatent('query', 'query', root1);
    XRenderBTree.addChildToPatent('delete', 'delete', root1);
    XRenderBTree.addChildToPatent('update', 'update', root1);
    XRenderBTree.addChildToPatent('create', 'create', root1);
    console.log(root1.toObject());
}