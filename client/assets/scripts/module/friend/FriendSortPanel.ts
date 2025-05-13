import { Button, Component, EditBox, EventHandler, EventTouch, Input, Label, Layout, Node, ScrollView, Sprite, SpriteFrame, Toggle, find, instantiate, path, sp, tween, view } from "cc";
import { Panel } from "../../GameRoot";
import { AutoScroller } from "../../utils/AutoScroller";
import { Session } from "../../net/Session";
import { MsgTypeSend } from "../../MsgType";
import { } from "../roleModule/PlayerData"
 import {SFriendSortType} from "../roleModule/PlayerStruct";

export class FriendSortPanel extends Panel {
    protected prefab: string = "prefabs/panel/friend/FriendSortPanel";

    private sortListNode: Node = null;
    private filtrateListNode: Node = null;
    private sortList: Node = null;
    private filtrateList: Node = null;
    // private tittle:Label;
    private serch: Node = null;
    private nav: Node = null;
    private sortData = [
        { id: SFriendSortType.SortDailyOutputDesc, string: `本日收益从高到低` },
        { id: SFriendSortType.SortDailyOutputAsc, string: `本日收益从低到高` },
        { id: SFriendSortType.SortTotalOutputDesc, string: `累计收益从高到低` },
        { id: SFriendSortType.SortTotalOutputAsc, string: `累计收益低到高` }, 
        { id: SFriendSortType.SortBindTimeDesc, string: `时间从早到晚` },
        { id: SFriendSortType.SortBindTimeAsc, string: `时间从晚到早` },
    ]

    private sortvipData = [
        { id: 1, string: `开通权益卡` }, 
    ]

    // private lastSortType:number;
    // private latSortSearch:string;

    private callBcak:Function;
    private selectSortType:SFriendSortType;
    private pageSize:number;
    private filter_type: number = 0;
    protected onLoad() {
        this.CloseBy("mask");
        this.CloseBy("panel/closeBtn");
        this.sortListNode = this.find(`panel/sortList`);
        this.filtrateListNode = this.find(`panel/filtrateList`);
        this.sortList = this.find(`panel/sortList/leftLayout`);
        this.filtrateList = this.find(`panel/filtrateList/leftLayout`);
        // this.tittle  = this.find("panel/sortList/title",Label);
        this.serch = this.find(`panel/serch`);
        this.nav = this.find(`panel/nav`);
        this.onBtnEvent();
    }

    private onBtnEvent() {
        this.nav.children.forEach((node, index) => {
            node.on(Input.EventType.TOUCH_END, () => {
                this.setNav(index)
            })
        })
        this.serch.getChildByName(`EditBox`).on(EditBox.EventType.EDITING_DID_ENDED, this.onEditEnd, this)
        this.sortList.getComponent(AutoScroller).SetHandle(this.updateSortItem.bind(this));
        this.filtrateList.getComponent(AutoScroller).SetHandle(this.updateFiltrateItem.bind(this));
       // this.filtrateList.getComponent(AutoScroller).node.on('select', this.onSelect, this);
    }
  
    protected onShow(): void {
        this.nav.children[0].getComponent(Toggle).isChecked = true;
    }

    flush(page_size:number,callback:Function, sort_type:number, search:string, filter_type: number) {  
        this.pageSize = page_size;
        this.callBcak = callback;
        this.selectSortType = sort_type;
        // this.latSortSearch = search;  
        this.filter_type = filter_type;    
        this.updataSortDatas(0);
        this.setNav(0)
    }

    private setNav(index) {
        // this.sortList.getComponent(ScrollView).content.removeAllChildren();  
        this.serch.active = (index != 0);
        this.sortListNode.active = (index == 0);
        this.filtrateListNode.active = (index == 1);
        // this.tittle.string = (index == 0) ? "排序搜索" : "筛选";
       
        this.serch.getComponentInChildren(EditBox).string = ``;
        this.resetNode(index);
    }

    private resetNode(index) {
        if(index == 0){
            let item = this.sortList.getComponent(ScrollView).content.children;
            item.forEach(item => {
                item.getSiblingIndex() + 1
                if( this.selectSortType == item.getSiblingIndex() + 1){
                    item.getComponent(Toggle).isChecked = true;
                }
            });  
        }else{  
            let filter_item = this.filtrateList.getComponent(ScrollView).content.children;
            filter_item.forEach(filter_item => {
                filter_item.getSiblingIndex() + 1
                if( this.filter_type == filter_item.getSiblingIndex() + 1){
                    filter_item.getComponent(Toggle).isChecked = true;
                }
            }); 
        }
    }

    private updataSortDatas(index) {
        // if(index == 0){
            this.sortList.getComponent(AutoScroller).UpdateDatas(this.sortData)
        // }else{   
            this.filtrateList.getComponent(AutoScroller).UpdateDatas(this.sortvipData)
        // }
    }

    /**搜索栏事件 */
    private onEditEnd() {
    }

    private updateSortItem(item, data) {
        item.getComponent(Toggle).isChecked = false;
        item.getChildByName(`title`).getComponent(Label).string = `${data.string}`;
        item.off(Toggle.EventType.TOGGLE);
        item.on(Toggle.EventType.TOGGLE, (toggle) => {
            if (toggle.getComponent(Toggle).isChecked) {
                this.selectSortType = data.id
            }
        })
    }

    private updateFiltrateItem(item, data) {
        item.getComponent(Toggle).isChecked = false;
        item.getChildByName(`title`).getComponent(Label).string = `${data.string}`;
        item.off(Toggle.EventType.TOGGLE);
        item.on(Toggle.EventType.TOGGLE, (toggle) => {
            if (toggle.getComponent(Toggle).isChecked) {
                this.filter_type = data.id
            }else{
                this.filter_type = 0
            }
        })
    }

    private onSend(){
        let str = this.serch.getComponentInChildren(EditBox).string;
        let data = {
            type:MsgTypeSend.GetDownlinesRequest,
            data:{page:1, page_size:this.pageSize, sort_type:this.selectSortType, filter_type: this.filter_type, search_player_id:str}
        }
        Session.Send(data);
    }

    // protected  onSelect(index: number, item: Node):void {
    //     console.log(item.getComponent(Toggle).isChecked)
    //     this.filter_type = item.getComponent(Toggle).isChecked ? 1 : 0;
    // }
 
    protected onHide(...args: any[]): void {      
       this.onSend();
       let playerid = this.serch.getComponentInChildren(EditBox).string;
       this.callBcak(this.selectSortType, playerid, this.filter_type);
       this.sortList.getComponent(ScrollView).content.removeAllChildren();
       this.filtrateList.getComponent(ScrollView).content.removeAllChildren();
    }
  
}