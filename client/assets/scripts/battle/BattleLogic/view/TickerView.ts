import { _decorator, math, Node, randomRange, tween, Vec3 } from 'cc';
import { SpriteLabel } from '../../../utils/SpriteLabel';
import { Mathf } from '../../../utils/Mathf';
import { Runtime } from '../Runtime';

export class TickerView {
    
    private tickerList = {};
    private BASE_ID = 1;

    Start() {
        for (let i = 0; i < 20; i++)
        {
            let type = i % 2 == 0 ? "hurt" : "heal";
            let data = {
                info: { value: type == "hurt" ?  -1 : 1 },
                camp: i % 2 + 1,
                pos: { x: 0, y: 0 },
                offset: 0,
                type: type
            }
            this.Play(data, false)
        }

        for (let i = 0; i < 5; i++)
            {
                let type = "hurt";
                let data = {
                    info: { value: type == "hurt" ?  -1 : 1, isCritical: true },
                    camp: i % 2 + 1,
                    pos: { x: 0, y: 0 },
                    offset: 0,
                    type: type
                }
                this.Play(data, false)
            }
    


    }

    Play(data, isShow = true)
    {
        let number = Number(data.info.value)
        if(isNaN(number)) return

        let font = data.type == "heal" ?  "sheets/common/number/hurt" : 
                    data.info.isCritical ? "sheets/common/number/baoji" :
                    data.camp == 1 ?  "sheets/common/number/damage" : "sheets/common/number/hit";
        let transform = Runtime.gameView.gameObjectPool.GetTicker(font);
        transform.active = isShow;
        let label = transform.getComponent(SpriteLabel);

        label.string =  number > 0 ? "+" + Math.ceil(number).toString()  : Math.floor(number).toString();
        
        let posView = Mathf.transform3dTo2d([data.pos.x, data.pos.y, 0]);
        if(data.offset)
        {
            posView[1] += data.offset * 1.3 + randomRange(-0.2, 0.2) * 64;
            posView[0] += randomRange(-0.2, 0.2) * 64;
        }


        Runtime.gameView.gameObjectPool.AddUI(transform);
        transform.setPosition(posView[0], posView[1]);

        this.Tween(label, 0.6, this.BASE_ID++);
    }

    Tween(label: SpriteLabel, time, index)
    {
        let posY = label.node.position.y + 30;
        label.node.setScale(0.8, 0.8);
        this.tickerList[index] = label;
        tween(label.node).to(time, {position: new Vec3(label.node.position.x, posY, 0), scale: new Vec3(1, 1, 1)}).call(()=>
        {
            if(this.tickerList.hasOwnProperty(index))
            {
                Runtime.gameView.gameObjectPool.release(this.tickerList[index]);
                delete this.tickerList[index];
            }
        }).start();
    }
    

    Update()
    {
        
    }

    End(){
        for (let key in this.tickerList)
        {
            if(this.tickerList.hasOwnProperty(key))
                Runtime.gameView.gameObjectPool.release(this.tickerList[key]);
        }
        this.tickerList = {};
    }
}


