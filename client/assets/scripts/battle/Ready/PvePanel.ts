import { Panel } from '../../GameRoot';
import { CardQuality, CfgMgr, ConditionType, StdCommonType, StdLevel } from '../../manager/CfgMgr';
import PlayerData, {} from '../../module/roleModule/PlayerData'
 import {FightState,SPlayerDataPve,SThing} from '../../module/roleModule/PlayerStruct';
import { BattleReadyLogic } from './BattleReadyLogic';
import { Node, Button, Sprite, SpriteFrame, instantiate, Label, path, Vec2, math, UITransform, Vec3, RichText, Toggle, Layout, Input, EventTouch, tween, sp, Layers, ScrollView, Color } from 'cc';
import { folder_icon, folder_item, ResMgr } from '../../manager/ResMgr';
import { AddBtnClick, maxx, minn } from '../../utils/Utils';
import { map } from '../../module/home/MapData';
import { DateUtils } from '../../utils/DateUtils';
import { Tips } from '../../module/login/Tips';
import { Loading } from '../../Loading';
import { ItemUtil } from '../../utils/ItemUtils';
import { ConsumeItem } from '../../module/common/ConsumeItem';
import { AdaptBgTop, FormatCondition, SetNodeGray } from '../../module/common/BaseUI'
import { AttrSub, ConditionSub } from '../../module/common/AttrSub';
import { ChangeScenePanel } from '../../module/home/ChangeScenePanel';
import { EventMgr, Evt_Hide_Home_Ui, Evt_PveMaploadFinish, Evt_Show_Home_Ui } from '../../manager/EventMgr';
import { MsgTypeRet, MsgTypeSend } from '../../MsgType';
import { Session } from '../../net/Session';
import { ItemTips } from '../../module/common/ItemTips';
import { Tips2 } from '../../module/home/panel/Tips2';
import { BuyTips } from '../../module/login/BuyTips';
import { MsgPanel } from '../../module/common/MsgPanel';
import { AutoScroller } from '../../utils/AutoScroller';
import { setColor } from '../../../../extensions/plugin-import-2x/creator/common/utlis';
import { ClickTipsPanel } from '../../module/common/ClickTipsPanel';
import { PveSaoDangPanel } from './PveSaoDangPanel';
import { PveNumBuyPanel } from './PveNumBuyPanel';
import { PveAwardPanel } from './PveAwardPanel';
import { PANEL_TYPE } from '../../manager/PANEL_TYPE';

interface BirdInfo {
    node: Node;
    speed: number;
    initPos: Vec3;
    isWait: boolean;
}

export class PvePanel extends Panel {

    
    protected prefab: string = 'prefabs/pve/PvePanel';

    levelInfo: StdLevel;

    _nowChapter: number = 0;
    _nowLevel: number;

    _level_map: Sprite;
    _backBtn: Node;

    _itemPrefab: Node;
    _finishLevelPrefab: Node;
    _levelPrefab: Node;

    _finishLevelContent: Node;
    _levelContent: Node;

    _levelCount;
    _levelProcess: Label;

    _tanxianBtn: Button;
    _tanxianBtnLab: Label;
    private zhangJieBtn:Button;
    private saoDangBtn:Button;
    private saoDangEffectLab:Label;
    private challengeNumLab:Label;
    
    private addBtn:Button;

    _pve_data: SPlayerDataPve;
    _testLevel : number;
    private tipsLab:RichText;
    private mapBlocks: number[] = [35, 37, 39, 44, 46]
    private blcokPosOffset: Vec2[] = [new Vec2(-242, -17), new Vec2(-3, -13), new Vec2(118, 235), new Vec2(-240, 66), new Vec2(9, -124)]
    private sMapScaleY = 1280;
    private sMapScaleX = 1024
    private xBlock = 11;
    private yBlock = 2;
    private mapNode: Node;
    private mapClick: Node;
    private chapterOffset: Vec3[]= [];

    private levelBattlePower;

    startX: number;
    touchStartX: number;
    showChapter: number;
    chapterNames = {};
    chapterMask: Node;

    private birds: BirdInfo[];
    private updateEffect = true;
    private nowChapterPos;
    private waitBirds: number;
    private _buzhenBtn: Button;
    // 是否布阵
    private deploy_formation: boolean;
    private levels;
    private pveConfig;

    private levelPoint: Node;
    protected onLoad() {
        this.CloseBy('top/back')
        this.mapNode = this.node.getChildByName("map");
        this.mapClick = this.mapNode.getChildByName("click");
        // this.node.getChildByPath('top/back').on(Button.EventType.CLICK, this.Hide, this);
        this._finishLevelContent = this.find("bottom/finish/view/content");
        this._levelContent = this.find("bottom/tiaozhan/view/content");
        this.tipsLab = this.find("bottom/tipsLab",RichText);
        this.saoDangBtn = this.find("bottom/saoDangBtn",Button);
        this.saoDangEffectLab = this.find("bottom/saoDangEffect/saoDangEffectLab",Label);
        this.challengeNumLab = this.find("bottom/challengeNumLab",Label);
        this.zhangJieBtn = this.find("bottom/zhangjie",Button);
        this.addBtn = this.find("bottom/addBtn", Button);

        this._itemPrefab = this.node.getChildByPath("Item/Icon");
        this._finishLevelPrefab = this.node.getChildByPath("Item/levelFinishItem");
        this._levelPrefab = this.node.getChildByPath("Item/levelTiaoZhanItem");
        this.levelPoint = this.node.getChildByName("level_point");

        this.node.getChildByPath("bottom/testLevel").active = false;
        //this.node.getChildByPath("bottom/testLevel").on('editing-return', this.onTestLevel, this);
        
        this._tanxianBtn = this.node.getChildByPath("bottom/tanxianBtn").getComponent(Button);
        this._tanxianBtnLab = this.node.getChildByPath("bottom/tanxianBtn/tanxianBtnLab").getComponent(Label);
        this._buzhenBtn = this.node.getChildByPath("bottom/buzhen").getComponent(Button);
        this._tanxianBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this._buzhenBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        
        this.chapterMask = this.node.getChildByPath("mask");
        this.node.getChildByPath("right/btn").on(Button.EventType.CLICK, ()=>{
            if(this.showChapter < this.levelPoint.children.length)
                this.showChapter++;
            this.ScrollChapter();
        }, this);
        this.node.getChildByPath("left/btn").on(Button.EventType.CLICK, ()=>{
            if(this.showChapter > 1)
                this.showChapter--;
            this.ScrollChapter();
        }, this);
        this.node.getChildByPath("top/info").on(Button.EventType.CLICK, ()=>{
            Tips2.Show(3);
        }, this);
        this.zhangJieBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.saoDangBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.addBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
        this.mapClick.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        this.mapClick.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.mapClick.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        this.mapClick.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        let chapterInfo = CfgMgr.GetChapterInfo();

        this.chapterNames = chapterInfo["chaptersName"];
        this.levels = chapterInfo["levels"];
        this.pveConfig = CfgMgr.GetCommon(StdCommonType.PVE);
        
        Session.on(MsgTypeRet.BuyPvETimesRet, this.onBuyPvETimes, this)
        Session.on(MsgTypeRet.PvESweepRet, this.onPvESweepRet, this);
    }

    onTouchStart(evt: EventTouch): void {
        // 获取触摸开始时的坐标
        this.startX = evt.getLocation().x;
        this.touchStartX = this.mapNode.getPosition().x;
    }

    onTouchMove(evt): void {
    
        // 获取当前触摸位置
        let currentX = evt.getLocation().x;
        
        // 计算移动距离
        let deltaX = this.startX - currentX;
        
        const moveX = this.mapNode.getPosition().x - this.touchStartX - deltaX;

        if(this.showChapter == 1 && moveX > 250)
            return;
        if(this.showChapter == this.levelPoint.children.length && moveX < -250)
            return;
        
        // 移动地图
        this.mapNode.setPosition(this.mapNode.getPosition().x - deltaX, this.mapNode.getPosition().y);
        
        this.startX = currentX;
    }

    onTouchEnd(evt): void{
        const moveX = this.mapNode.getPosition().x - this.touchStartX;
        if(Math.abs(moveX) > 250)
        {
            if(moveX > 0)
            {
                if(this.showChapter > 1)
                    this.showChapter--;
            }
            else
            {
                if(this.showChapter < this.levelPoint.children.length)
                    this.showChapter++;
            }
        }

        this.ScrollChapter();
    }

    private ScrollChapter()
    {
        let endPosition = this.node.getChildByPath(`level_point/level_${this.showChapter}`).getPosition();
        tween(this.mapNode).to(0.3, {position: endPosition}).call(()=>{
            //this.chapterMask.active = this.showChapter > this.levelInfo.Chapter;
        }).start();
    }


    protected onShow(...arg: any[]) {
        let select_type = arg[0]
        this.node.active = false;
        this.chapterMask.active = false;
        this._testLevel = 0;
        this._pve_data = PlayerData.pveData;
        this.levelInfo = CfgMgr.GetLevel(this._pve_data.progress + 1);
        if(!this.levelInfo)
            this.levelInfo = CfgMgr.GetLevel(this._pve_data.progress);
        this.showChapter = this.levelInfo.Chapter;
        if(this.levelInfo.Chapter > this.levelPoint.children.length)
        {
            console.error("关卡配置错误, 预制体中章节不存在：", this.levelInfo.Chapter);
            this.showChapter = this.levelPoint.children.length;
        }

        this.nowChapterPos = this.levelPoint.getChildByName(`level_${this.showChapter}`).getPosition();
        this.mapNode.setPosition(this.nowChapterPos);
        if(this.levelInfo.Chapter != this._nowChapter)
        {
            //await ChangeScenePanel.PlayEffect(Evt_PveMaploadFinish);
        }
        this._levelCount = CfgMgr.GetLevelCountByChapter(this.levelInfo.Chapter);

        this.updateLevelInfo(this.node.getChildByPath("bottom/middle"), this.levelInfo);
        this.updateButtonInfo();
        this.loadMap();
        this.loadChapter();
        if(select_type == 1){
            this.onBtnClick(this.saoDangBtn)
        }

    }

    private loadChapter():void{
        if(!this.birds)
            this.birds = [];
        for(let i = 1; i <= this.levelPoint.children.length; i++)
        {
            let chapter = this.mapNode.getChildByPath(`chapter_info/chapter_${i}`);
            chapter.off(Button.EventType.CLICK);
            let progress = chapter.getChildByName("Label");
            let lock = chapter.getChildByName("lock");
            lock.active = i <= this.levelInfo.Chapter ? false : true;
            progress.active = i <= this.levelInfo.Chapter ? true : false;
            progress.getComponent(Label).string = i < this.levelInfo.Chapter ? "100%" : (i == this.levelInfo.Chapter ? `${Math.floor((this.levelInfo.LevelID - 1) / this._levelCount * 100)}%` : "");
            if(this.chapterNames.hasOwnProperty(i))
            {
                chapter.getChildByName("text").getComponent(Label).string = this.chapterNames[i].name;
                if(lock.active){
                    chapter.on(Button.EventType.CLICK, ()=>{MsgPanel.Show(CfgMgr.GetText("pve_4", {level: this.chapterNames[i].level}))}, this);
                }
        
            }
            else
                chapter.getChildByName("text").getComponent(Label).string = this.levelInfo.ChapterName;
       
                let effect = chapter.getChildByName("effect");
                if(effect)
                {
                    let ske = effect.getChildByName("ske").getComponent(sp.Skeleton);
                    ske.setAnimation(0, "animation", true);
                }
    
                for (let j = 1; j < 3; j++) {
                    let bird = chapter.getChildByName("bird" + j);
                    if(!bird) continue;
                    let birdSkt = bird.getChildByName("ske").getComponent(sp.Skeleton);
                    birdSkt.setAnimation(0, "animation", true);
                    
                    bird.setPosition(-1080 - j * 200, -j * 100, 0);
                    this.birds.push({
                        node: bird,
                        speed: 150 + Math.random() * 100,
                        initPos: bird.getPosition(),
                        isWait: true
                    });
                }
        }
    }
  


    public flush(...args: any[]): void {
    }
    protected onHide(...args: any[]): void {
        // if(!HomeUI.Showing)
        //     HomeUI.Show();
        EventMgr.emit(Evt_Show_Home_Ui);
        
        this.birds = [];
        ClickTipsPanel.Hide();
    }
    private onBtnClick(btn:Button):void{
        
        switch(btn){
            case this.zhangJieBtn:
                PveAwardPanel.Show(this._pve_data.progress);
                break;
            case this._tanxianBtn:
                if(this._pve_data.times < 1){
                    MsgPanel.Show("探险次数不足");
                    return;
                }
                this.toBattle();
                break;
            case this._buzhenBtn:
                this.deploy_formation = true;
                this.toBattle();
                this.deploy_formation = false;
                break;
            case this.saoDangBtn:
                PveSaoDangPanel.Show();
                break;
            case this.addBtn:
                PveNumBuyPanel.Show();
                break;
            
        }
    }
    private toBattle():void{
        this.Hide();
        // HomeUI.Hide();//关闭主界面
        EventMgr.emit(Evt_Hide_Home_Ui);

        if(this._testLevel > 0)
            this.levelInfo = CfgMgr.GetLevel(this._testLevel);


        let battleData = {
            type: FightState.PvE,
            player_id: 101,
            homeland_id: 101,
            battle_power: this.levelInfo.Power,
            stage_id: this.levelInfo.ID,
            mapId: this.levelInfo.Map,
            icon: "",
            monsters: this.levelInfo.Monsters,
            deploy_formation: this.deploy_formation
        }

        if(!BattleReadyLogic.ins)
            new BattleReadyLogic();
        BattleReadyLogic.ins.RealyBattle(battleData);
    }
    
    private updateButtonInfo()
    {
        let condIdList:number[] = this.levelInfo.ConditionId ? this.levelInfo.ConditionId : [];
        let condValList:number[] = this.levelInfo.ConditionValue ? this.levelInfo.ConditionValue : [];
        let condData:ConditionSub = null;
        for (let index = 0; index < condIdList.length; index++) {
            let condId:number = condIdList[index];
            let condVal:number = condValList[index];
            if(condId == ConditionType.Home_1){
                    condData = FormatCondition(condId, condVal, "生命树升级至<color=#EBCF40>%s级</color>解锁当前关卡");
            }else if(condId == ConditionType.PlayerPower){
                    condData = FormatCondition(condId, condVal, "玩家总战力达<color=#EBCF40>%s</color>解锁当前关卡");
                    this.levelBattlePower = condVal;
            }else{
                condData = FormatCondition(condId, condVal);
            }

            if(condData && condData.fail) break;
        }
        this.challengeNumLab.string =`${this._pve_data.times}次`;
        if(condData && condData.fail){
            this._tanxianBtnLab.string = "未解锁";
            this.tipsLab.string = condData.fail;
            SetNodeGray(this._tanxianBtn.node, true, true); 
            //SetNodeGray(this.saoDangBtn.node, true, true);  
        }else{
            this._tanxianBtnLab.string = "探险";
            this.tipsLab.string = "每日免费次数<color=#EBCF40>0点</color>重置，可消耗道具探险";
            SetNodeGray(this._tanxianBtn.node, false, true);   
            //SetNodeGray(this.saoDangBtn.node, false, true);  
        }
        let szBattlePower = PlayerData.roleInfo.role_type_max_sum_battle_power || 0;
        let stdInfo:StdLevel = CfgMgr.GetSaoDangLevel(PlayerData.pveData.progress, szBattlePower);
        let id:number = stdInfo ? stdInfo.ID : 1;
        this.saoDangEffectLab.string = `第${id}关`;
    }

    private async loadMap()
    {

        if(this._nowChapter <= 0)
        {
            this._nowChapter = this.levelInfo.Chapter;
            await this.LoadingMap();
        }
        EventMgr.emit(Evt_PveMaploadFinish);

        if(this._nowLevel != this.levelInfo.ID)
        {
            this._nowLevel = this.levelInfo.ID;
            this._levelContent.removeAllChildren();
            this._finishLevelContent.removeAllChildren();

            
            //this.levelItem_scroller.ScrollToIndex(this.levelInfo.LevelID);

            // if(this.levelInfo.ItemAttrSub != undefined)
            // {
            //     for(let i = 0; i < this.levelInfo.ItemAttrSub.length; i++)
            //     {
            //         let item = instantiate(this._itemPrefab);
            //         item.setPosition(0, 0, 0);
            //         if(this.levelInfo.ItemAttrSub[i].quality)
            //             item.getChildByName("bg").getComponent(Sprite).spriteFrame = await ResMgr.LoadResAbSub<SpriteFrame>(path.join(folder_icon, "quality", this.levelInfo.ItemAttrSub[i].quality + "_bag_bg", "spriteFrame") , SpriteFrame);
            //         item.getChildByName("icon").getComponent(Sprite).spriteFrame = await ResMgr.LoadResAbSub<SpriteFrame>(this.levelInfo.ItemAttrSub[i].icon, SpriteFrame);
            //         item.getChildByName("count").getComponent(Label).string = this.levelInfo.ItemAttrSub[i].value.toString();
            //         item.off(Button.EventType.CLICK);
            //         item.on(Button.EventType.CLICK, ()=>{ ItemTips.Show(this.levelInfo.ItemAttrSub[i]) }, this);
            //     }

            // }

            for(let i = 1; i <= this._levelCount - this.levelInfo.LevelID; i++)
            {
                let nextLevelInfo = CfgMgr.GetLevel(this._nowLevel + i);
                let level = instantiate(this._levelPrefab);
                this._levelContent.addChild(level);
                this.updateLevelInfo(level.getChildByName("tiaozhan"), nextLevelInfo);
                if(i > 3) // 仅加载3个
                    break;
            }

            for(let i = 1; i < this._nowLevel; i++)
            {
                let lastLevelInfo = CfgMgr.GetLevel(this._nowLevel - i);
                let finish = instantiate(this._finishLevelPrefab);
                this._finishLevelContent.addChild(finish);
                this.updateLevelInfo(finish.getChildByName("finish"), lastLevelInfo);
                if(i >= 1) // 仅加载3个
                    break;
            }
        }

        this.node.active = true;
    }

    private updateLevelInfo(node: Node, levelInfo: StdLevel)
    {
        if(!levelInfo) return;

        node.getChildByName("next").active = levelInfo.LevelID != this._levelCount;

        switch(levelInfo.LevelType)
        {
            case 1:
                let now = node.getChildByName("regular");
                now.active = true;
                now.getChildByName("level").getComponent(Label).string = levelInfo.LevelID.toString();
                node.getChildByPath("expert").active = false;
                node.getChildByPath("boss").active = false;
                break;
            case 2:
                node.getChildByPath("expert").active = true;
                node.getChildByName("regular").active = false;
                node.getChildByPath("boss").active = false;
                break;
            case 3:
                node.getChildByPath("expert").active = false;
                node.getChildByName("regular").active = false;
                node.getChildByPath("boss").active = true;
                break;
            default:
                break;
        }
    }


    // private async LoadingMap()
    // {
    //     if(this._nowChapter > this.mapBlocks.length)
    //         return;

    //      // 给定序号
    //      const index1 = this.mapBlocks[maxx(this._nowChapter - 1, 0)];
    //      const index2 = this.mapBlocks[minn(this._nowChapter, this.mapBlocks.length - 1)];
     
    //      // 行列索引计算
    //      let col1 = ((index1 - 1) % this.xBlock) + 1;
    //      let col2 = ((index2 - 1) % this.xBlock) + 1; 
     
    //      // 合并区域边界计算
    //      let startCol = Math.min(col1 - 1, col2 - 1);
    //      let endCol = Math.max(col1 + 1, col2 + 1);
 
    //      startCol = startCol < 1 ? 1 : startCol;
    //      endCol = endCol > 15 ? 15 : endCol;

    //      this.chapterOffset.push(this.offset(index1, col1, startCol, this.blcokPosOffset[maxx(this._nowChapter - 1, 0)]))
    //      this.chapterOffset.push(this.offset(index2, col2, endCol, this.blcokPosOffset[minn(this._nowChapter, this.mapBlocks.length - 1)]))
    //      this.mapNode.setPosition(this.chapterOffset[0])
    
    //      this.mapNode.removeAllChildren();
    //      // 加载合并区域的 SpriteFrames
    //      for (let y = 0; y < this.yBlock; y++) {
    //          for (let x = startCol; x <= endCol; x++) {
    //              const spriteFrame = await ResMgr.LoadResAbSub<SpriteFrame>(this.getSpriteFrameByIndex(x, y), SpriteFrame);
    //              if (spriteFrame) {
    //                  let node = new Node();
    //                  const sprite = node.addComponent(Sprite);
    //                  sprite.spriteFrame = spriteFrame;
    //                  node.getComponent(UITransform).setAnchorPoint(0, 1)
    //                  // 计算节点位置，将 index1 对应的中心放在视图中心
    //                  node.setPosition((x - startCol) * this.sMapScale, -y * this.sMapScale);
    //                  this.mapNode.addChild(node);
    //              }
    //          }
    //      }
    // }

    // 根据索引获取 SpriteFrame 的路径
    //2850   -2840  155 
    // 1730  -1730  158 
    // 640   -622   154
    // -1530  1547  158
    // -2856  2856 158
    private async LoadingMap()
    {
        //this.mapNode.removeAllChildren();
        // 加载合并区域的 SpriteFrames
        for (let y = 0; y < this.yBlock; y++) {
            for (let x = 0; x < this.xBlock; x++) {
                const spriteFrame = await ResMgr.LoadResAbSub<SpriteFrame>(this.getSpriteFrameByIndex(x, y), SpriteFrame);
                if (spriteFrame) {
                    let node = new Node();
                    const sprite = node.addComponent(Sprite);
                    sprite.spriteFrame = spriteFrame;
                    node.getComponent(UITransform).setAnchorPoint(0, 1)
                    this.mapNode.addChild(node);
                    // 计算节点位置，将 index1 对应的中心放在视图中心

                    node.setPosition(x * this.sMapScaleX - this.mapNode.getComponent(UITransform).contentSize.x / 2, -y * this.sMapScaleY + this.mapNode.getComponent(UITransform).contentSize.y / 2);
                }
            }
        }
        let chapter = this.mapNode.getChildByName("chapter_info");
        chapter.setSiblingIndex(this.mapNode.children.length - 1);
        chapter.active = true;
        this.mapClick.setSiblingIndex(this.mapNode.children.length - 1);
    }

    _BirdMove(bird: BirdInfo, dt) {
        let x = bird.node.position.x;
        let y = bird.node.position.y;
        let time = dt;
        
        // 计算新的 y 位置，模拟上下波动
        y += (Math.random() * 2 - 1) * 2;
        
        // // 确保 y 值在 -bird.amplitude 和 bird.amplitude 之间
        // y = Math.min(bird.amplitude, Math.max(-bird.amplitude, y));
        
        // 更新小鸟的位置
        bird.node.setPosition(x + bird.speed * time, y, 0);
    }


    private getSpriteFrameByIndex(x: number, y: number) {
        let index = (y * this.xBlock) + x + 1;
        return `pve/map/G_${(index < 10 ? '0' : '') + index}/spriteFrame`;
    }


    // private offset(index: number, nowCol: number, col: number, offset: Vec2)
    // {
    //     let xOffset = (col - nowCol) * this.sMapScale + this.sMapScale / 2 - this.node.getComponent(UITransform).width / 2;
    //     let yOffset = (index / this.xBlock) * this.sMapScale + this.sMapScale / 2 - 50;
    //     return new Vec3(xOffset - offset.x, yOffset + offset.y, 0);
    // }
    
    private onTestLevel(data)
    {
        const level = Number(data.string);
        if(level == undefined || level <= 0)
            return;

        let config = CfgMgr.GetLevels()[level]
        if(config)
            this._testLevel = level;
    }

    private onBuyPvETimes(data){
        PlayerData.updataPveData(data.pve_data);
        this._pve_data = data.pve_data;
        this.updateButtonInfo();
    }
    private onPvESweepRet(data:{stage_id:number, result:string,reward_types:number[],reward_ids:number[],reward_numbers:number[], casualties:any, pve_data:SPlayerDataPve}):void{
        if (data.pve_data){
            PlayerData.updataPveData(data.pve_data);
            this._pve_data = PlayerData.pveData;
            this.updateButtonInfo();
        }
        
    }
    protected update(dt: number): void {
        if(!this.updateEffect) return;
        this.waitBirds = 0;
        for (let bird of this.birds) {
            if (bird.node.position.x + bird.node.parent.position.x + this.mapNode.getPosition().x > 1080) {
                bird.node.setPosition(bird.initPos);
                bird.speed = 150 + Math.random() * 100;
                bird.isWait = true;
            }
            if (!bird.isWait) 
                this._BirdMove(bird, dt);
            else
                this.waitBirds++;
        }
        if(this.waitBirds == this.birds.length)
            this.birds.forEach(bird => bird.isWait = false);
    }
}


