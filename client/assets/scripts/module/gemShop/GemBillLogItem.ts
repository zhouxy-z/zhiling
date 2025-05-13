import { Color, Component, Label, Sprite, SpriteFrame } from "cc";
import { } from "../roleModule/PlayerData"
 import {SQueryThing,SThing} from "../roleModule/PlayerStruct";
import { ItemUtil } from "../../utils/ItemUtils";
import { CfgMgr, StdCommonType, ThingItemId } from "../../manager/CfgMgr";
import { formatNumber } from "../../utils/Utils";
import { DateUtils } from "../../utils/DateUtils";
import { ResMgr } from "../../manager/ResMgr";

export class GemBillLogItem extends Component {
    private icon:Sprite;
    private titleLab:Label;
    private valLab:Label;
    private timeLab:Label;
    private isInit:boolean = false;
    private data:SQueryThing;
    private _color:Color = new Color();
    protected onLoad(): void {
        this.icon = this.node.getChildByName("icon").getComponent(Sprite);
        this.titleLab = this.node.getChildByName("titleLab").getComponent(Label);
        this.valLab = this.node.getChildByName("valLab").getComponent(Label);
        this.timeLab = this.node.getChildByName("timeLab").getComponent(Label);
        this.isInit = true;
        this.updateShow();
    }

    SetData(data:SQueryThing) {
        this.data = data;
        this.updateShow();
    }
    
    private updateShow():void {
        if(!this.isInit || !this.data) return;
        this.icon.node.active = false;
        let item = ItemUtil.CreateThing(this.data.type2, 0, 0);
        ResMgr.LoadResAbSub(item.resData.iconUrl, SpriteFrame, res => {
            this.icon.node.active = true;
            this.icon.spriteFrame = res;
        });
        let keepPre:number = 0;
        if(item.item.id == ThingItemId.ItemId_202){
            keepPre = CfgMgr.GetCommon(StdCommonType.Gem).KeepPre;
        }else if(ThingItemId[item.item.id]){
            keepPre = 2;
        }
        this.titleLab.string = CfgMgr.GetTransactionInfo(this.data.source)|| this.data.source.toString();
        let val:number = Math.abs(this.data.count);
        let valStr:string = keepPre > 0 ? formatNumber(val, keepPre) : val.toString();
        if(this.data.count > 0){
            this.valLab.string = valStr;
            this._color.fromHEX("#498127");
        }else{
            this.valLab.string = "-" + valStr;
            this._color.fromHEX("#AD5858");
        }
        this.valLab.color =  this._color;

        this.timeLab.string = CfgMgr.GetTransactionInfo(this.data.source) || this.data.source.toString();
        let dates:string[] = DateUtils.TimestampToDate(this.data.time * 1000, true);
        this.timeLab.string = `${dates[0]}-${dates[1]}-${dates[2]}  ${dates[3]}:${dates[4]}:${dates[5]}`;
    }
}