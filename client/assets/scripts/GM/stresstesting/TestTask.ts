import { MsgTypeRet, MsgTypeSend } from "../../MsgType";
import { CfgMgr, StdTask } from "../../manager/CfgMgr";
import { } from "../../module/roleModule/PlayerData"
 import {SPlayerDataTask,STaskState} from "../../module/roleModule/PlayerStruct";
import { UnitTest } from "../UnitTest";
import { ITest } from "./ITest";

export class TestTask implements ITest {
    private player: UnitTest;
    private callBack: Function;
    private running: Promise<any>;
    private handle: Function;
    constructor() {
        let self = this;
        this.running = new Promise((resolve, reject) => {
            self.handle = resolve;
        });
    }

    async run(entry: UnitTest | string, host?: string, callBack?: (result: any) => void) {
        this.callBack = callBack;
        if (typeof (entry) == "string") {
            this.player = new UnitTest(entry, host);
        } else {
            this.player = entry;
        }

        await this.player.loginning;

        this.player.on(MsgTypeRet.TaskDataChangedPush, this.onTask, this);
        this.player.on(MsgTypeRet.CompleteTaskRet, this.onTask, this);
        return this.running;
    }
    destory() {
        this.player.off(MsgTypeRet.TaskDataChangedPush, this.onTask, this);
        this.player.off(MsgTypeRet.CompleteTaskRet, this.onTask, this);
    }

    private onTask(data: any) {
        if (!data || !data.task) {

        } else {
            this.player.playerInfo.tasks[data.task.id] = data.task;
            this.getTask();
        }
    }

    getTask() {
        let player = this.player;
        let stdMainTask = this.getActiveTask();
        if (!stdMainTask) {
            this.callBack?.();
            this.handle();
            return false;
        }
        let data: SPlayerDataTask;
        if (player.playerInfo.tasks[stdMainTask.TaskId]) {
            data = player.playerInfo.tasks[stdMainTask.TaskId];
        } else {
            data = {
                id: stdMainTask.TaskId,
                v: 0,
                s: 1,
                lrt: 0,
            }
        }
        let stdTask = CfgMgr.GetTaskById(data.id);
        if (data.v >= stdTask.CompletionNum) {
            let info = {
                type: MsgTypeSend.CompleteTask,
                data: {
                    task_id: stdMainTask.TaskId
                }
            }
            player.Send(info);
            return true;
        } else {
            this.callBack?.();
            this.handle();
            return false;
        }
    }
    /**获取展示任务 */
    private getActiveTask() {
        let player = this.player;
        let stdTasks: StdTask[] = CfgMgr.GetTaskType(3);
        for (let task of stdTasks) {//已经完成的主线
            if (task.ShowTask == 1) {
                if (player.playerInfo.tasks[task.TaskId] && player.playerInfo.tasks[task.TaskId].s == STaskState.unFinsh) {
                    if (task.CompletionNum <= player.playerInfo.tasks[task.TaskId].v) return task;
                }
            }
        }
        let stdAllTasks: StdTask[] = CfgMgr.GetTask();
        for (let task of stdAllTasks) {//已经完成的任务
            if (task.Show != 4 && task.Show != 5) {
                if (player.playerInfo.tasks[task.TaskId] && player.playerInfo.tasks[task.TaskId].s == STaskState.unFinsh) {
                    if (task.CompletionNum <= player.playerInfo.tasks[task.TaskId].v) return task;
                }
            }
        }
        for (let task of stdTasks) {//未完成主线
            if (task.ShowTask == 1) {
                if (player.playerInfo.tasks[task.TaskId] && player.playerInfo.tasks[task.TaskId].s == STaskState.unFinsh) {
                    return task;
                }
            }
        }
        for (let task of stdAllTasks) {//未完成任务
            if (task.Show != 4 && task.Show != 5) {
                if (player.playerInfo.tasks[task.TaskId] && player.playerInfo.tasks[task.TaskId].s == STaskState.unFinsh) {
                    return task;
                }
            }
        }
        return stdTasks[0];
    }
}