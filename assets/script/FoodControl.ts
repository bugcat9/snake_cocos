import { _decorator, Collider2D, Component, Contact2DType, Node, PhysicsSystem, PhysicsSystem2D, resources, Sprite, SpriteAtlas } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FoodControl')
export class FoodControl extends Component {
    isDead: boolean = false;
    word: string = '';

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

    setSpriteFrame(w: string) {
        this.word = w;
        w = 'Apple' + w;
        const sprite = this.getComponent(Sprite);
        if (sprite) {
            resources.load("apple", SpriteAtlas, (err, atlas) => {
                const frame = atlas.getSpriteFrame(w);
                sprite.spriteFrame = frame;
            });
        }
    }
}