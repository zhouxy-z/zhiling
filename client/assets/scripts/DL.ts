
export class DL {

    static Check: (conditionId: number, value: any) => any;
    static FormatCondition: (conditionId: number, value: number, ...arg: any) => any;
    static FormatRewards: (std: { RewardType: number[], RewardID: number[], RewardNumber: number[] }) => any;
    static GetValue: (type: string, std: { AttrFight: number[], AttrFightValue: number[], Attr: number[], AttrValue: number[] }) => void;
    static GetAttrValue: (type: number, std: { Attr: number[], AttrValue: number[] }) => any;
    static GetFightAttrValue: (type: number, std: { AttrFight: number[], AttrFightValue: number[] }) => any;
    
}
