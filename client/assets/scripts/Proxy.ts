import { DL } from "./DL";
import { Decoupling } from "./Decoupling";
import { CheckCondition } from "./manager/ConditionMgr";
import { FormatCondition, FormatRewards, GetAttrValue, GetFightAttrValue, GetValue } from "./module/common/BaseUI";

export function CircularDependency() {
    DL.Check = CheckCondition;
    DL.FormatCondition = FormatCondition;
    DL.FormatRewards = FormatRewards;
    DL.GetValue = GetValue;
    DL.GetAttrValue = GetAttrValue;
    DL.GetFightAttrValue = GetFightAttrValue;
    new Decoupling();
}

export function OnLoginServer() {
    // Object.defineProperty(Label.prototype, "string", {
    //     get: function () {
    //         return this._string;
    //     },
    //     set: function (value) {
    //         if (value === null || value === undefined) {
    //             value = '';
    //         } else {
    //             value = value.toString();
    //         }
    //         if (GameSet.GetServerMark() == "hc") {
    //             value = value.replace(/彩虹体/g, "幻彩石");
    //         }
    //         if (this._string === value) {
    //             return;
    //         }

    //         this._string = value;
    //         this.markForUpdateRenderData();
    //     }
    // });

    // Object.defineProperty(RichText.prototype,"string",{
    //     get :function() {
    //         return this._string;
    //     },
    //     set :function (value) {
    //         if (this._string === value) {
    //             return;
    //         }
    //         if (GameSet.GetServerMark() == "hc") {
    //             value = value.replace(/彩虹体/g, "幻彩石");
    //         }
    //         this._string = value;
    //         this._updateRichTextStatus();
    //     }
    // });
}