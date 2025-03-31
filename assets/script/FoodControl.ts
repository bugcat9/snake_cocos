import { _decorator, Collider2D, Component, Contact2DType, Node, PhysicsSystem, PhysicsSystem2D, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FoodControl')
export class FoodControl extends Component {
    isDead: boolean = false;
    start() {
        
    }

    update(deltaTime: number) {

    }

    die() {
        if (this.isDead) return;
        this.isDead = true;
        setTimeout(() => {
            this.node?.destroy?.();
        }, 10);
    }

}


