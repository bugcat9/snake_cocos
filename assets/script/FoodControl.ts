import { _decorator, Collider2D, Component, Contact2DType, Node, PhysicsSystem, PhysicsSystem2D } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FoodControl')
export class FoodControl extends Component {
    isDead: boolean = false;
    start() {
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.END_CONTACT, this.onContactBegin, this);
        }else{
            console.error("FoodControl: Collider2D component not found!");
        }
    }

    onContactBegin(selfCollider: Collider2D, otherCollider: Collider2D) {
        if (this.isDead) return;
        this.isDead = true;
        // 碰到食物后，销毁食物节点
        this.node?.destroy?.();
        // this.scheduleOnce(() => {
           
        // }, 0);
    }

    update(deltaTime: number) {

    }
}


