import { _decorator, Component, Node, Animation, EventKeyboard, input, Input, KeyCode } from 'cc';
const { ccclass, property } = _decorator;

enum Direction {
    UP,
    DOWN,
    LEFT,
    RIGHT
}

@ccclass('HeadControl')
export class HeadControl extends Component {

    private isFlipped = false; // 用于追踪当前是否翻转
    private flipInterval = 0.5; // 翻转间隔时间，单位秒
    private elapsedTime = 0;
    private direction = Direction.RIGHT;

    // @property(Animation)
    // anim: Animation | null = null;

    protected onLoad(): void {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.ARROW_UP:
                this.direction = Direction.UP;
                break;
            case KeyCode.ARROW_DOWN:
                this.direction = Direction.DOWN;
                break;
            case KeyCode.ARROW_LEFT:
                this.direction = Direction.LEFT;
                break;
            case KeyCode.ARROW_RIGHT:
                this.direction = Direction.RIGHT;
                break;
            default:
                // 不处理其他按键
                break;
        }
    }


    start() {
        // if (this.anim) {
        //     this.anim.play('animation'); // 替换为您的动画剪辑名称
        // }else{
        //     console.error('Animation component not found on the node.');
        // }
    }

    update(deltaTime: number) {
        // this.elapsedTime += deltaTime;
        // if (this.elapsedTime >= this.flipInterval) {
        //     this.isFlipped = !this.isFlipped; // 切换翻转状态
        //     this.node.setScale(1, this.isFlipped ? -1 : 1);
        //     this.elapsedTime = 0; // 重置计时器
        // }
        const { x, y } = this.node.getPosition();
        let moveX: number = x;
        let moveY: number = y;
        if (this.direction === Direction.RIGHT) {
            moveX = x + 50 * deltaTime;
        } else if (this.direction === Direction.LEFT) {
            moveX = x - 50 * deltaTime;
        } else if (this.direction === Direction.UP) {
            moveY = y + 50 * deltaTime;
        } else if (this.direction === Direction.DOWN) {
            moveY = y - 50 * deltaTime
        }
        this.node.setPosition(moveX, moveY);
    }
}


