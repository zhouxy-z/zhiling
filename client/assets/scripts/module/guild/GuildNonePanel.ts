import { Input, js, Node, path, Sprite, SpriteFrame, Toggle } from "cc";
import { Panel } from "../../GameRoot";
import { EventMgr, Evt_Hide_Scene, Evt_Show_Scene } from "../../manager/EventMgr";
import { GuildCreatPage } from "./GuildCreatPage";
import { GuildJoinPage } from "./GuildJoinPage";
import { GuildRankPage } from "./GuildRankPage";
import { ResMgr } from "../../manager/ResMgr";
import LocalStorage from "../../utils/LocalStorage";
import PlayerData from "../roleModule/PlayerData";
import { Tips3 } from "../home/panel/Tips3";

enum GuildNoneTabType {
    Page_GuildRank,//公会排行
    Page_GuildJoin,//加入公会
    Page_GuildCreat,//创建公会
};
export class GuildNonePanel extends Panel {
    protected prefab: string = "prefabs/panel/guild/GuildNonePanel";
    private titleImg:Sprite;
    private creatPage:GuildCreatPage;
    private joinPage:GuildJoinPage;
    private rankPage:GuildRankPage;
    private navBtns:Node[];
    private page:GuildNoneTabType;
    protected onLoad(): void {
        this.titleImg = this.find("titleImg").getComponent(Sprite);
        this.creatPage = this.find("creatPage").addComponent(GuildCreatPage);
        this.joinPage = this.find("joinPage").addComponent(GuildJoinPage);
        this.rankPage = this.find("rankPage").addComponent(GuildRankPage);
        this.navBtns = this.find("navBar/view/content").children.concat();
        for (let btn of this.navBtns) {
            btn.on('toggle', this.onPage, this);
        }
        this.CloseBy("backBtn");
        this.find("heleBtn2").on(Input.EventType.TOUCH_END, this.onHelpBtn2, this);
    }
    public flush(page:GuildNoneTabType): void{
        let is_first = LocalStorage.GetBool("firsr_guide" + PlayerData.roleInfo.player_id);
        if(!is_first){
            this.onHelpBtn2();
            LocalStorage.SetBool("firsr_guide" + PlayerData.roleInfo.player_id, true);
        }
        this.page = undefined;
        if(page == undefined){
            page = GuildNoneTabType.Page_GuildRank;
        }
        this.navBtns[page].getComponent(Toggle).isChecked = true;
        this.onPage(this.navBtns[page].getComponent(Toggle));
    }
    
    protected onShow(): void {
        EventMgr.emit(Evt_Hide_Scene, js.getClassName(this));
    }

    protected onHide(...args: any[]): void {
        EventMgr.emit(Evt_Show_Scene, js.getClassByName(this));
    }
    
    private onPage(t: Toggle):void{
        
        if (!t.isChecked) return;
        let page = this.navBtns.indexOf(t.node);
        if (page < 0 || page == this.page) return;
        this.page = page;
        this.creatPage.onHide();
        this.joinPage.onHide();
        this.rankPage.onHide();
        switch (page) {
            case GuildNoneTabType.Page_GuildRank: 
                this.rankPage.onShow();
                break;
            case GuildNoneTabType.Page_GuildJoin:
                this.joinPage.onShow();
                break;
            case GuildNoneTabType.Page_GuildCreat: 
                this.creatPage.onShow();
                break;
        }
        let url = path.join("sheets/guild", `title_${page + 1}`, "spriteFrame");
        ResMgr.LoadResAbSub(url, SpriteFrame, res => {
            this.titleImg.spriteFrame = res;
        });
    }

    private onHelpBtn2() {
        Tips3.Show(5);
    }
    
}