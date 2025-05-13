import { js, Node, path, sp } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { WorldBossRankItem } from "./WorldBossRankItem";
import { WorldBossRankTopItem } from "./WorldBossRankTopItem";
import { GameSet } from "../GameSet";
import { ResMgr } from "../../manager/ResMgr";
import { AdaptBgTop } from "../common/BaseUI";
import { EventMgr, Evt_Hide_Scene, Evt_Show_Scene, Evt_WorldBossRankUpdate } from "../../manager/EventMgr";
import PlayerData from "../roleModule/PlayerData";
import { SWorldBossRankData, SWorldBossRankItemData } from "../roleModule/PlayerStruct";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";

export class WorldBossRankPanel extends Panel {
    protected prefab: string = "prefabs/panel/worldBoss/WorldBossRankPanel";
    private noneListCont:Node;
    private top3Item:WorldBossRankTopItem[] = [];
    private rankList:AutoScroller;
    private myRankItem:WorldBossRankItem;
    private rankData:SWorldBossRankData;
    private isGetData:boolean = false;
    protected onLoad(): void {
        this.top3Item.push(this.find("top3Cont/rank1").addComponent(WorldBossRankTopItem));
        this.top3Item.push(this.find("top3Cont/rank2").addComponent(WorldBossRankTopItem));
        this.top3Item.push(this.find("top3Cont/rank3").addComponent(WorldBossRankTopItem));
        this.noneListCont = this.find("noneListCont");
        this.rankList = this.find("rankList").getComponent(AutoScroller);
        this.rankList.SetHandle(this.updateRankItem.bind(this));
        this.myRankItem = this.find("myRankItem").addComponent(WorldBossRankItem);
        this.CloseBy("backBtn");
    }
    public async flush(data:any, type:number): Promise<void>{
        this.isGetData = false;
        let node_list = this.find("top3Cont").children.concat();
        for (let node of node_list) {
            let spine = node.getChildByName("bodyModel").getComponent(sp.Skeleton)
            let url = path.join("spine/role_p/", "role_001_ngr", "role_001_ngr");
            if(GameSet.GetServerMark() == "hc"){
                url = path.join("spine/role_p/", "hc_role_001_ngr", "hc_role_001_ngr");
            }
            let skeletonData = await ResMgr.LoadResAbSub(url, sp.SkeletonData);
            spine.skeletonData = skeletonData;
        }
        this.rankData = null;
        this.updateShow();
        Session.Send({ type: MsgTypeSend.GetBossFightRank, data: {type:1, cnt:100, t: 0} });
    }
    
    protected onShow(): void {
        AdaptBgTop(this.find("titleCont"));
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
        EventMgr.on(Evt_WorldBossRankUpdate, this.onWorldBossRankUpdate, this);
    }

    protected onHide(): void {
        EventMgr.emit(Evt_Show_Scene,  js.getClassByName(this));
        EventMgr.off(Evt_WorldBossRankUpdate, this.onWorldBossRankUpdate, this);
        
    }
    private onWorldBossRankUpdate():void{
        if(this.isGetData) return;
        this.isGetData = true;
        this.rankData = PlayerData.worldBossRankData;
        this.updateShow();
    }
    private updateShow():void{
        let top3List:any[] = [
            {
                id:null,
                name:"虚位以待",
                harm:0,
            },
            {
                id:null,
                name:"虚位以待",
                harm:0,
            },
            {
                id:null,
                name:"虚位以待",
                harm:0,
            },
        ];
        let rankList:SWorldBossRankItemData[] = this.rankData && this.rankData.rank_data_list ? this.rankData.rank_data_list:[];
        
        let myRankData:SWorldBossRankItemData = {
            id:PlayerData.roleInfo.player_id,
            name:PlayerData.roleInfo.name,
            harm:this.rankData ? this.rankData.harm : 0,
        };
        let otherRankList:SWorldBossRankItemData[] = [];
        let myRank:number = 0;
        for (let index = 0; index < rankList.length; index++) {
            let rankData:SWorldBossRankItemData = rankList[index];
            if(rankData.id == PlayerData.roleInfo.player_id){
                myRankData = rankData;
                myRank = index + 1;
            }
            if(index < top3List.length){
                top3List[index] = rankData;
            }else{
                otherRankList.push(rankData);
            }
        }
        this.updateTop3Cont(top3List);
        this.updateOtherCont(otherRankList);
        this.updateMyRankCont(myRankData, myRank);
    }
    private updateTop3Cont(topRankList:SWorldBossRankItemData[]):void{
        for (let index = 0; index < this.top3Item.length; index++) {
            let rankItem = this.top3Item[index];
            rankItem.SetData(topRankList[index], index + 1);
        }
    }
    private updateOtherCont(otherRankList:SWorldBossRankItemData[]):void{
        this.rankList.UpdateDatas(otherRankList);
        this.noneListCont.active = otherRankList.length < 1;
    }
    private updateMyRankCont(rankData:SWorldBossRankItemData, rank:number):void{
        this.myRankItem.SetData(rankData,rank);
    }
    protected updateRankItem(item: Node, data: SWorldBossRankItemData, index:number) {
        let rankItem = item.getComponent(WorldBossRankItem) || item.addComponent(WorldBossRankItem);
        rankItem.SetData(data, index + 4);
    }
}