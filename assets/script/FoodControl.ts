import { _decorator, Collider2D, Component, Contact2DType, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FoodControl')
export class FoodControl extends Component {
    isDead: boolean = false;
    start() {
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D) {
        if (this.isDead) return;
        this.isDead = true;
        // 碰到食物后，销毁食物节点
        setTimeout(() => {
            this.node?.destroy?.();
        }, 200);
        console.log("self", self, "other", otherCollider);
    }

    update(deltaTime: number) {

    }
}


