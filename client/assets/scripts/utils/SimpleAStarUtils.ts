import { Size, v2, v3, Vec2, Vec3 } from "cc";

/**
 * 简易a星寻路
 */
export class SimpleAStarUtils {
    private static openList:CellStep[];
    private static closeList:CellStep[];
    private static mapDatas:number[][];//地图数据
    
    //查找露点下标
    private static findIndexStepList(pos:Vec2, stepList:CellStep[]):number {
        for(let i = 0; i < stepList.length; i++){
            if(pos.x == stepList[i].pos.x && pos.y == stepList[i].pos.y) return i;
        }
        return -1;
    }  

    private static insetStepToOpen(step:CellStep):void{
        let i:number = 0;
        for(i; i < this.openList.length; i++){
            if(step.f <= this.openList[i].f) break;
        }
        this.openList.splice(i, 0, step);
    }
    private static getNextCanMoveCell(curPos:Vec2):Vec2[]{
        let addCell = (pos:Vec2, list:Vec2[])=>{
            if(this.mapDatas[pos.y][pos.x] == 0){
                list.push(pos);
            }
        };

        let results:Vec2[] = [];
        let left:Vec2 = v2(curPos.x - 1, curPos.y);
        if(left.x >= 0){
            addCell(left, results);
            let leftTop:Vec2 = v2(curPos.x - 1, curPos.y + 1);
            if(leftTop.y < this.mapDatas.length){
                addCell(leftTop, results);
            }
            let leftBottom:Vec2 = v2(curPos.x - 1, curPos.y - 1);
            if(leftBottom.y >= 0){
                addCell(leftBottom, results);
            }
        }
        let right:Vec2 = v2(curPos.x + 1, curPos.y);
        if(right.x < this.mapDatas[0].length){
            addCell(right, results);
            let rightTop = v2(curPos.x + 1, curPos.y + 1);
            if(rightTop.y < this.mapDatas.length){
                addCell(rightTop, results);
            }
            let rightBottom:Vec2 = v2(curPos.x + 1, curPos.y - 1);
            if(rightBottom.y >= 0){
                addCell(rightBottom, results);
            }
        }
        let top:Vec2 = v2(curPos.x, curPos.y + 1);
        if(top.y < this.mapDatas.length){
            addCell(top, results);
        }
        let bottom:Vec2 = v2(curPos.x, curPos.y - 1);
        if(bottom.y >= 0){
            addCell(bottom, results);
        }
        return results;
    }
    /**
     * 地图坐标转换格子坐标
     * @param x 地图x
     * @param y 地图y
     * @param cellSize 格子大小 
     * @returns 
     */
    public static mapPosToCellPos(x:number, y:number, cellSize:Size):Vec2{
        x = Math.floor((x - cellSize.width / 2) / cellSize.width);
        y = Math.floor((y - cellSize.height / 2) / cellSize.height);
        let pos:Vec2 = v2(x, y);
        return pos;
    }
    /**
     * 格子坐标转换地图坐标
     * @param x 格子行下标
     * @param y 格子列下表
     * @param cellSize 格子大小
     * @returns 
     */
    public static cellPosToMapPos(x:number, y:number, cellSize:Size):Vec3{
        x = Math.floor(x);
        y = Math.floor(y);
        let pos:Vec3 = v3(x * cellSize.width + cellSize.width / 2, y * cellSize.height + cellSize.height / 2);
        return pos;
    }
    /**
     * 查找路径
     * @param startPos 开始格子坐标 
     * @param targetPos 目标格子坐标
     * @param mapDatas 地图数据
     * @returns 
     */
    public static findPath(startPos:Vec2, targetPos:Vec2, mapDatas:number[][]):Vec2[]{
        this.mapDatas = mapDatas;
        this.openList = [];
        this.closeList = [];
        let pathList:Vec2[] = [];
        this.openList.push(new CellStep(startPos));
        do{
            let curStep:CellStep = this.openList.shift();
            this.closeList.push(curStep);
            if(curStep.pos.x == targetPos.x && curStep.pos.y == targetPos.y){
                do{
                    pathList.unshift(curStep.pos);
                    curStep = curStep.last;
                } while(curStep != null)
                break;
            }
            let canMoveList:Vec2[] = this.getNextCanMoveCell(curStep.pos);
            for(let i = 0; i < canMoveList.length; i++){
                let tempPos:Vec2 = canMoveList[i];
                if(this.findIndexStepList(tempPos, this.closeList) != -1){
                    canMoveList.splice(i, 1);
                    i--;
                    continue;
                }
                let step:CellStep = new CellStep(tempPos);
                let costMove:number = tempPos.x != curStep.pos.x && tempPos.y != curStep.pos.y ? 14 : 10;
                let openIndex:number = this.findIndexStepList(tempPos, this.openList);
                if(openIndex == -1){
                    step.last = curStep;
                    step.g = curStep.g + costMove;
                    step.h = (Math.abs(tempPos.x - targetPos.x) + Math.abs(tempPos.y - targetPos.y)) * 10;
                    this.insetStepToOpen(step);
                }else{
                    let stepOp:CellStep = this.openList[openIndex];
                    if(curStep.g + costMove < stepOp.g){
                        stepOp.g = curStep.g + costMove;
                        stepOp.last = curStep;
                        this.openList.splice(openIndex, 1);
                        this.insetStepToOpen(stepOp);
                    }
                }
            }
        } while(this.openList.length > 0)

        return pathList;
    }

}
class CellStep{
    public g:number = 0;
    public h:number = 0;
    public pos:Vec2 = v2();
    public last:CellStep = null;
    private _f:number;

    constructor(pos:Vec2){
        this.pos = pos;
    }

    get f():number{
        return this.g + this.h;
    }

    set f(f:number){
        this._f = f;
    }
}