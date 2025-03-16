import { _decorator, Component, instantiate, Node, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SnakeBodyControl')
export class SnakeBodyControl extends Component {

    @property(Prefab)
    body: Prefab;
    
    onLoad(){
        const body = instantiate(this.body);
        const head = this.node.parent;
        const { x, y } = head.getPosition();
        body.setParent(this.node);
        body.setPosition(x - 24, y);
    }

    start() {

    }

    update(deltaTime: number) {
        // const head = this.node.parent;
        // const { x, y } = head.getPosition();
        // for (let item of this.node.children) {
            
        // }
    }

    growSnake() {

    }
}


