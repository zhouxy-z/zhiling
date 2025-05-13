
/**用于显示用的数据 */
export type AttrSub = {
    icon: string;
    name: string;
    value: any;
    next: any;
    per: string;      //数值后缀
    quality?: string;
    id?: number;
}

/**条件数据 */
export type ConditionSub = {
    id?: number;//条件id
    name: string;
    icon: string;
    value1?: number;//条件值1
    value2?: number;//条件值2
    fail?: string;
}
