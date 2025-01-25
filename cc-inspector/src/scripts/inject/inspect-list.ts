export class InspectTarget {
  private list = [];

  /**
   * 是否启用过滤
   */
  enabled: boolean = false;
  addInspectType(item: any) {
    if (!this.list.find((el) => item === el)) {
      this.list.push(item);
    }
    console.log(this.list);
  }

  removeInspectType(item: any) {
    this.list.splice(this.list.indexOf(item), 1);
    console.log(this.list);
  }
  cleanInspectType() {
    this.list.length = 0;
  }
  isContainInspectType(type: any) {
    return !!this.list.find((el) => type === el);
  }

  checkNodeComponentsIsInList(node: any) {
    const comps = node._components;
    for (let i = 0; i < comps.length; i++) {
      const comp = comps[i];
      if (this.list.find((el) => comp instanceof el)) {
        return true;
      }
    }
    return false;
  }
}

export const inspectTarget = new InspectTarget();
