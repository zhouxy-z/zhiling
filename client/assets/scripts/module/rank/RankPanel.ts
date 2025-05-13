import { Button, EventTouch, Input, Label, Layout, Node, Toggle, instantiate, js, path, sp } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { RankItem } from "./RankItem";
import { RankTopItem } from "./RankTopItem";
import { EventMgr, Evt_Hide_Scene, Evt_Show_Scene } from "../../manager/EventMgr";
import PlayerData, { } from "../roleModule/PlayerData"
 import {SPlayerDataRole, SRankData,SRankType} from "../roleModule/PlayerStruct";
import { Http, SendGetCurrencyRankData, SendGetRankData, SendGetRoleRankData } from "../../net/Http";
import { GameSet } from "../GameSet";
import { AdaptBgTop } from "../common/BaseUI";
import { CfgMgr, StdRole } from "../../manager/CfgMgr";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { ResMgr } from "../../manager/ResMgr";
import LocalStorage from "../../utils/LocalStorage";
enum RankTabType {
    Page_RankFight,//战力排行页
    Page_RankLevel,//等级排行页
    Page_RankCustomsPass,//排行关卡页
    page_RankRole,//植灵排行页
    page_RankCurrency,//货币排行页
};
export class RankPanel extends Panel {
    protected prefab: string = "prefabs/panel/rank/RankPanel";
    private noneListCont: Node;
    private top3Cont: Node[];
    private top3Item: RankTopItem[] = [];
    private rankList_fight: AutoScroller;
    private rankList_level: AutoScroller;
    private rankList_customs: AutoScroller;
    private rankList_role: AutoScroller;
    private rankList_currency: AutoScroller;
    private rankList: AutoScroller;
    private myRankItem: RankItem;
    private navBtns: Node[];
    private content:Node;
    private combox_item1:Node;
    private item_name:Label
    private item_3:Node;
    private role_combox_item:Node
    private combox_open: Node;
    private combox_close: Node;
    private combox_item_bg: Node;

    private valueCont: Node;
    private page: RankTabType;
    private curRankType: SRankType;
    private roleRankType: number
    private role_type_id:number

    private myRank: number = 0;
    private rankData: SRankData[];
    protected onLoad(): void {
        this.top3Cont = this.find("top3Cont").children.concat();
        this.top3Item.push(this.find("top3Cont/rank1").addComponent(RankTopItem));
        this.top3Item.push(this.find("top3Cont/rank2").addComponent(RankTopItem));
        this.top3Item.push(this.find("top3Cont/rank3").addComponent(RankTopItem));
        this.noneListCont = this.find("noneListCont");
        this.rankList_fight = this.find("rankList_fight").getComponent(AutoScroller);
        this.rankList_fight.SetHandle(this.updateRankItem.bind(this));
        this.rankList_level = this.find("rankList_level").getComponent(AutoScroller);
        this.rankList_level.SetHandle(this.updateRankItem.bind(this));
        this.rankList_customs = this.find("rankList_customs").getComponent(AutoScroller);
        this.rankList_customs.SetHandle(this.updateRankItem.bind(this));
        this.rankList_role = this.find("rankList_role").getComponent(AutoScroller);
        this.rankList_role.SetHandle(this.updateRankItem.bind(this));
        this.rankList_currency = this.find("rankList_currency").getComponent(AutoScroller);
        this.rankList_currency.SetHandle(this.updateRankItem.bind(this));
        this.valueCont = this.find("listBg/valueCont");

        this.role_combox_item = this.find("combox_item");
        this.content = this.find("combox_item/combox_item_bg/ScrollView/view/content");
        this.combox_item1 = this.find("combox_item/combox_item1");
        this.item_name = this.find("combox_item/combox/item_name", Label);
        this.item_3 = this.find("combox_item/item_3");
        this.combox_item_bg = this.find("combox_item/combox_item_bg");
        this.combox_open = this.find("combox_item/combox/open");
        this.combox_close = this.find("combox_item/combox/close");
        this.combox_open.on(Input.EventType.TOUCH_END, this.onOpenComboxItem, this);
        this.combox_close.on(Input.EventType.TOUCH_END, this.onCloseComboxItem, this);

        this.myRankItem = this.find("myRankItem").addComponent(RankItem);
        this.navBtns = this.find("navBar/view/content").children.concat();
        for (let btn of this.navBtns) {
            btn.on('toggle', this.onPage, this);
        }
       
        this.CloseBy("backBtn");
    }
    public async flush(page: RankTabType) {
        for (let node of this.top3Cont) {
            let spine = node.getChildByName("bodyModel").getComponent(sp.Skeleton)
            let url = path.join("spine/role_p/", "role_001_ngr", "role_001_ngr");
            let name = "彩虹体";
            if(GameSet.GetServerMark() == "hc"){
                url = path.join("spine/role_p/", "hc_role_001_ngr", "hc_role_001_ngr");
                name = "幻彩石";
            }else if(GameSet.GetServerMark() == "xf"){
                url = path.join("spine/role_p/", "hc_role_001_ngr", "hc_role_001_ngr");
                name = "灵石";
            }
            let skeletonData = await ResMgr.LoadResAbSub(url, sp.SkeletonData);
            spine.skeletonData = skeletonData;    
            this.navBtns[RankTabType.page_RankCurrency].children[0].getChildByName("lab").getComponent(Label).string = name;
            this.navBtns[RankTabType.page_RankCurrency].children[1].getChildByName("lab").getComponent(Label).string = name;
        }
        
        this.page = undefined;
        this.myRank = 0;
        if (page == undefined) {
            page = RankTabType.Page_RankFight;
        }
        this.navBtns[page].getComponent(Toggle).isChecked = true;
        this.onPage(this.navBtns[page].getComponent(Toggle));
    }

    protected onShow(): void {
        AdaptBgTop(this.find("titleCont"))
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
    }

    protected onHide(...args: any[]): void {
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
    }

    private onPage(t: Toggle): void {
        if (!t.isChecked) return;
        let page = this.navBtns.indexOf(t.node);
        if (page < 0 || page == this.page) return;
        this.page = page;
        for (let index = 0; index < this.valueCont.children.length; index++) {
            const element = this.valueCont.children[index];
            if (page == index) {
                element.active = true;
                if(page == RankTabType.page_RankCurrency){
                    element.children[0].active = false;
                    element.children[1].active = false;
                    element.children[2].active = false;
                    if(GameSet.GetServerMark() == "hc"){
                        element.children[1].active = true;
                    }else if(GameSet.GetServerMark() == "xf"){
                        element.children[2].active = true;
                    }else{
                        element.children[0].active = true;
                    }
                }
            } else {
                element.active = false;
            }
        }
        this.rankList_fight.node.active = false;
        this.rankList_level.node.active = false;
        this.rankList_customs.node.active = false;
        this.rankList_role.node.active = false;
        this.rankList_currency.node.active = false
        this.role_combox_item.active = false;
        switch (page) {
            case RankTabType.Page_RankFight: //战力
                this.curRankType = SRankType.Fight;
                this.rankList_fight.node.active = true;
                this.rankList = this.rankList_fight;
                break;
            case RankTabType.Page_RankLevel: //等级
                this.curRankType = SRankType.Level;
                this.rankList_level.node.active = true;
                this.rankList = this.rankList_level;
                break;
            case RankTabType.Page_RankCustomsPass: //关卡
                this.curRankType = SRankType.CustomsPass;
                this.rankList_customs.node.active = true;
                this.rankList = this.rankList_customs;
                break;
            case RankTabType.page_RankRole: //植灵
                this.curRankType = SRankType.Role;
                this.roleRankType = 1;
                this.role_type_id = 3;
                this.role_combox_item.active = true
                this.rankList_role.node.active = true;
                this.rankList = this.rankList_role;
                this.setRoleList();
                break;
            case RankTabType.page_RankCurrency: //货币
                this.curRankType = SRankType.Currency;
                this.roleRankType = 3;
                this.role_type_id = 0;
                this.rankList_currency.node.active = true;
                this.rankList = this.rankList_currency;
                break;
        }
        if(page == RankTabType.page_RankRole){
            this.sendRoleRandData();
        }else if(page == RankTabType.page_RankCurrency){
            this.sendCurrencyRandData();
        }else{
            this.sendRandData();
        }
    }
    private updateShow(): void {
        let _battle_power =  PlayerData.roleInfo.battle_power
        if(this.curRankType == SRankType.Role){
            if(this.roleRankType == 1){
                _battle_power = this.getRareRoleBattle(this.role_type_id)
            }else{
                _battle_power = this.getTypeRoleBattle(this.role_type_id)
            }
        }
        let top3List: SRankData[] = [
            {
                player_id: null,
                name: "虚位以待",
                icon_url: "",
                battle_power: 0,
                progress: 0,
                level: 0,
                rank: 1,
                currency: 0,
            },
            {
                player_id: null,
                name: "虚位以待",
                icon_url: "",
                battle_power: 0,
                progress: 0,
                level: 0,
                rank: 2,
                currency: 0,
            },
            {
                player_id: null,
                name: "虚位以待",
                icon_url: "",
                battle_power: 0,
                progress: 0,
                level: 0,
                rank: 3,
                currency: 0,
            },
        ];
        let rankList: SRankData[] = this.rankData;
        let home_all_lv = PlayerData.roleInfo.homelands[0].level
        let myRankData: SRankData = {
            player_id: PlayerData.roleInfo.player_id,
            name: PlayerData.roleInfo.name,
            icon_url: PlayerData.roleInfo.icon_url,
            battle_power: _battle_power,
            progress: PlayerData.roleInfo.pve_data.progress,
            level: home_all_lv,
            rank: this.myRank,
            currency: PlayerData.roleInfo.currency
        };
        let otherRankList: SRankData[] = [];
        if (rankList) {
            for (let index = 0; index < rankList.length; index++) {
                let rankData: SRankData = rankList[index];
                rankData.rank = index + 1;
                if (rankData.player_id == PlayerData.roleInfo.player_id && this.page != RankTabType.page_RankRole) {
                    if(this.page == RankTabType.page_RankCurrency){
                        myRankData.currency = rankData.currency;
                    }else{
                        myRankData = rankData;
                    }
                }
                if (index < top3List.length) {
                    top3List[index] = rankData;
                } else {
                    otherRankList.push(rankData);
                }
            }
        }
        this.updateTop3Cont(top3List);
        this.updateOtherCont(otherRankList);
        this.updateMyRankCont(myRankData);
    }
    private updateTop3Cont(topRankList: any[]): void {
        for (let index = 0; index < this.top3Item.length; index++) {
            let rankItem = this.top3Item[index];
            rankItem.SetData(topRankList[index], this.curRankType);
            this.top3Cont[index].off(Input.EventType.TOUCH_END)
            this.top3Cont[index].on(Input.EventType.TOUCH_END, () => {
                if (topRankList[index].player_id && topRankList[index].player_id != PlayerData.roleInfo.player_id) {
                    // TODO 发送查看玩家数据
                    Session.Send({
                        type: MsgTypeSend.GetPlayerViewInfo,
                        data: {
                            player_id: topRankList[index].player_id,
                        }
                    });
                };
            });
        }
    }
    private updateOtherCont(otherRankList: any[]): void {
        this.rankList.UpdateDatas(otherRankList);
        this.noneListCont.active = otherRankList.length < 1;
    }
    private updateMyRankCont(rankData: any): void {
        this.myRankItem.SetData(rankData, this.curRankType);
    }
    protected updateRankItem(item: Node, data: any) {
        let rankItem = item.getComponent(RankItem);
        if (!rankItem) rankItem = item.addComponent(RankItem);
        rankItem.SetData(data, this.curRankType);
    }

    /**设置角色列表 */
    private setRoleList(){
        this.content.removeAllChildren();
        let all_tag = [3, 2, 1];
        let all_tag_name = ["稀有", "高级", "普通"];
        let all_tag_data = []

        let firsr_item_btn = null;
        let role_list = this.getQualityByType();
        for (let index = 0; index < all_tag.length; index++) {
            let role_list_data: StdRole[] = role_list[index];
            let data = {
                tag: all_tag[index],
                roleData: role_list_data,
                tagName: all_tag_name[index]
            }
            all_tag_data.push(data);
            let item = instantiate(this.combox_item1);
            item.name = "item" + all_tag[index];
            item.setPosition(0, 0);
            item["Data"] = data;   
            item.getChildByPath("layout/input/label").getComponent(Label).string = all_tag_name[index];
            let item_btn = item.getComponent(Button);
            item_btn.node.off("click", this.openOneTag.bind(this), this)
            item_btn.node.on("click", this.openOneTag.bind(this), this)
            this.content.addChild(item);
            if(index == 0){
                firsr_item_btn = item_btn;
            }
        }
        this.onOpenComboxItem();
        this.openOneTag(firsr_item_btn)

    }

    //打开1级列表
    private openOneTag(e: Button) {
        let item: Node = e.target;
        this.closeGroupList(item);
        this.roleRankType = 1;
        this.role_type_id = item["Data"].tag;
        let content = item.getChildByPath("layout/content")
        //选中后请求协议
        this.sendRoleRandData();
        if (content.children.length > 0) {
            content.removeAllChildren();
            item.children.forEach(element => {
                element.getComponent(Layout).updateLayout(true);
            }) 
            return
        }
        content.removeAllChildren();
        //设置选中标题
        this.item_name.string = item["Data"].tagName;
        
        let role_list: StdRole[] = item["Data"].roleData;
        for (let index = 0; index < role_list.length; index++) {
            const element = role_list[index]
            let tag_item3 = instantiate(this.item_3);
            tag_item3.name = "item3" + index;
            tag_item3.setPosition(0, 0);
            tag_item3["roleData"] = element;
            tag_item3.getChildByName("item_name").getComponent(Label).string = element.Name;
            tag_item3.getChildByPath("item_select/item_name").getComponent(Label).string = element.Name;
            tag_item3.off(Input.EventType.TOUCH_END, this.setectItemName.bind(this), this);
            tag_item3.on(Input.EventType.TOUCH_END, this.setectItemName.bind(this), this);
            content.addChild(tag_item3);
        }
        item.children.forEach(element => {
            element.getComponent(Layout).updateLayout(true);
        });
    }

    /**关闭同组下的其它列表 */
    private closeGroupList(item: Node, tag?: number) {
        if (tag == 2) {
            //该组的上级标签置灰
            item.parent.parent.getChildByPath("input/frame_select").active = false;
        }
        //关闭同组下的其它列表
        let item_content = item.parent.children
        for (let index = 0; index < item_content.length; index++) {
            const element = item_content[index];
            let _combox_item2 = element.getChildByPath("layout/input/frame_select");
            if (_combox_item2) {
                element.getChildByPath("layout/input/frame_select").active = false;
                if (element.name != item.name) {
                    this.closeTag(element)
                }
            } else {
                element.getChildByName("item_select").active = false;
            }

        }
        //点亮当前标签页
        let cur_combox_item = item.getChildByPath("layout/input/frame_select");
        if (cur_combox_item) {
            item.getChildByPath("layout/input/frame_select").active = true;
        } else {
            item.getChildByName("item_select").active = true;
        }
    }

    /**选中某个物品 */
    private setectItemName(e: EventTouch) {
        let item = e.target;
        this.roleRankType = 2;
        this.role_type_id = item["roleData"].RoleType;
        item.parent.parent.getChildByPath("input/frame_select").active = false;
        let content = item.parent.children;
        for (let index = 0; index < content.length; index++) {
            const element = content[index];
            let _combox_item2 = element.getChildByPath("layout/input/frame_select");
            if (_combox_item2) {
                element.getChildByPath("layout/input/frame_select").active = false;
                this.closeTag(element)
            } else {
                element.getChildByName("item_select").active = false;
            }
        }

        let cur_combox_item2 = item.getChildByPath("layout/input/frame_select");
        if (cur_combox_item2) {
            item.getChildByPath("layout/input/frame_select").active = true;
        } else {
            item.getChildByName("item_select").active = true;
        }
        this.sendRoleRandData();
    }

    //收起列表
    private closeTag(node) {
        let item: Node = node;
        let content = item.getChildByPath("layout/content")
        content.removeAllChildren();
    }

    /**打开列表 */
    private onOpenComboxItem() {
        this.combox_open.active = false;
        this.combox_close.active = true;
        this.combox_item_bg.active = true;
    }
    
    /**隐藏列表 */
    private onCloseComboxItem() {
        this.combox_open.active = true;
        this.combox_close.active = false;
        this.combox_item_bg.active = false;
    }

    //获取展示的角色
    private getQualityByType() {
        let illustrated_role = [];
        let role_data = CfgMgr.GetRole();
        let RoleTypeQual_0 = [];
        let RoleTypeQual_1 = [];
        let RoleTypeQual_2 = [];
        for (const key in role_data) {
            let role = role_data[key];
            if (role.RoleTypeQual == 2) {
                RoleTypeQual_2.push(role);
            } else if (role.RoleTypeQual == 1) {
                RoleTypeQual_1.push(role);
            } else if(role.RoleTypeQual == 0) {
                RoleTypeQual_0.push(role);
            }
        }
        illustrated_role.push(RoleTypeQual_2);
        illustrated_role.push(RoleTypeQual_1);
        illustrated_role.push(RoleTypeQual_0);
        return illustrated_role;
    }

    /**玩家未上榜时是否拥有该英雄 */
    private getTypeRoleBattle(type:number){
        let role_type_list:SPlayerDataRole[] = []
        let role_data = PlayerData.GetRoles();
        for (const iterator of role_data) {
            if(iterator.type == type){
                role_type_list.push(iterator)
            }
        }
        if(role_type_list.length > 1){
            role_type_list.sort((a,b)=>{
                return b.battle_power - a.battle_power
            })
        }
        let battle_power =  role_type_list.length > 0 ?  role_type_list[0].battle_power : 0
        return battle_power;
    }

     /**玩家未上榜时是否拥有该英雄 */
     private getRareRoleBattle(rare:number){
        let rare_role_list:SPlayerDataRole[][] = []
        let RoleTypeQual_0 = [];
        let RoleTypeQual_1 = [];
        let RoleTypeQual_2 = [];
        let role_data = PlayerData.GetRoles();
        for (const iterator of role_data) {
            let role = iterator;
            let cfg = CfgMgr.GetRole()[iterator.type]
            if (cfg.RoleTypeQual == 2) {
                RoleTypeQual_2.push(iterator);
            } else if (cfg.RoleTypeQual == 1) {
                RoleTypeQual_1.push(iterator);
            } else if(cfg.RoleTypeQual == 0) {
                RoleTypeQual_0.push(iterator);
            }
        }
        let index = rare - 1;
        rare_role_list.push(RoleTypeQual_0)
        rare_role_list.push(RoleTypeQual_1)
        rare_role_list.push(RoleTypeQual_2)  
        if(rare_role_list[index].length > 1){
            rare_role_list[index].sort((a,b)=>{
                return b.battle_power - a.battle_power
            })
        }
        let battle_power =   rare_role_list[index].length > 0 ?   rare_role_list[index][0].battle_power : 0
        return battle_power;
    }

    /**
     * 请求排行榜数据
     */
    private async sendRandData(): Promise<void> {
        let playerId = PlayerData.roleInfo.player_id
        let data: any = SendGetRankData;
        data.serverUrl = GameSet.Server_cfg.Rank;
        let rankDatas = await Http.Send(data, { rank_type: this.curRankType, page: 1, page_size: 100, player_id: playerId });
        if (!rankDatas) return;
        this.rankData = rankDatas["data"].rankings || [];
        this.myRank = rankDatas["data"].player_rank;
        this.updateShow();
    }

    /**
     * 请求排行榜数据
     */
    private async sendRoleRandData(): Promise<void> {
        let playerId = PlayerData.roleInfo.player_id
        let data: any = SendGetRoleRankData;
        data.serverUrl = GameSet.Server_cfg.Rank;
        let rankDatas = await Http.Send(data, { rank_type: this.roleRankType, page: 1, page_size: 100, player_id: playerId, rank_id:this.role_type_id, t:0});
        if (!rankDatas) return;
        this.rankData = rankDatas["data"].rankings || [];
        this.myRank = rankDatas["data"].player_rank;
        this.updateShow();
    }


    /**
     * 请求排行榜数据
     */
    private async sendCurrencyRandData(): Promise<void> {
        let playerId = PlayerData.roleInfo.player_id
        let data: any = SendGetCurrencyRankData
        data.serverUrl = GameSet.Server_cfg.Rank;
        let rankDatas = await Http.Send(data, { rank_type: this.roleRankType, page: 1, page_size: 100, player_id: playerId, rank_id:this.role_type_id, t:0});
        if (!rankDatas) return;
        this.rankData = rankDatas["data"].rankings || [];
        this.myRank = rankDatas["data"].player_rank;
        this.updateShow();
    }

}