import { _decorator, Component, Node, Animation, EventKeyboard, input, Input, KeyCode, Prefab, instantiate, Collider2D, Contact2DType, Vec3, randomRangeInt, Sprite, SpriteFrame, PhysicsSystem2D, PhysicsSystem, IPhysics2DContact } from 'cc';
import { GameControl } from './GameControl';
import { GlobalParam } from './GlobalParam';
const { ccclass, property } = _decorator;

enum Direction {
    RIGHT,
    LEFT,
    UP,
    DOWN
}

@ccclass('HeadControl')
export class HeadControl extends Component {

    private isFlipped = false; // 用于追踪当前是否翻转
    private flipInterval = 0.5; // 翻转间隔时间，单位秒
    private elapsedTime = 0;
    private direction = Direction.RIGHT;

    @property({ type: Node })
    gameMgr: Node | null = null; // 游戏管理节点

    @property({ type: [SpriteFrame] })
    headSprites: SpriteFrame[] = []; // 方向对应的图片资源

    protected onLoad(): void {
        GlobalParam.getInstance().snakeHead = this.node; // 设置蛇头节点
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        console.log('onBeginContact');
        if (otherCollider.node.name === 'Food') {
            console.log("吃到食物了");
            this.gameMgr?.getComponent(GameControl)?.growSnake();
        }
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case KeyCode.ARROW_UP:
                {
                    if (this.direction !== Direction.DOWN) {
                        this.direction = Direction.UP;
                        this.updateHeadSprite();
                    }
                }
                break;
            case KeyCode.ARROW_DOWN:
                {
                    if (this.direction !== Direction.UP) {
                        this.direction = Direction.DOWN;
                        this.updateHeadSprite();
                    }
                }
                break;
            case KeyCode.ARROW_LEFT:
                {
                    if (this.direction !== Direction.RIGHT) {
                        this.direction = Direction.LEFT;
                        this.updateHeadSprite();
                    }
                }
                break;
            case KeyCode.ARROW_RIGHT:
                {
                    if (this.direction !== Direction.LEFT) {
                        this.direction = Direction.RIGHT;
                        this.updateHeadSprite();
                    }
                }
                break;
            default:
                // 不处理其他按键
                break;
        }

    }


    start() {
    }

    update(deltaTime: number) {
        this.elapsedTime += deltaTime;
        if (this.elapsedTime >= this.flipInterval) {
            this.isFlipped = !this.isFlipped; // 切换翻转状态
            // if (this.direction === Direction.LEFT || this.direction === Direction.RIGHT) {
            //     this.node.setScale(1, this.isFlipped ? -1 : 1);
            // } else if (this.direction === Direction.UP || this.direction === Direction.DOWN) {
            //     this.node.setScale(this.isFlipped ? -1 : 1, 1);
            // }
            this.elapsedTime = 0; // 重置计时器
            this.moveSnake(deltaTime);
        }
    }

    moveSnake(deltaTime: number) {
        // 保存蛇头的当前位置
        const headPosition = this.node.getPosition();

        // 更新蛇身的位置（从尾部到头部依次更新）
        for (let i = GlobalParam.getInstance().snakeBody.length - 1; i > 0; i--) {
            GlobalParam.getInstance().snakeBody[i].setPosition(GlobalParam.getInstance().snakeBody[i - 1].position);
        }

        // 蛇身的第一个部分跟随蛇头的当前位置
        GlobalParam.getInstance().snakeBody[0].setPosition(headPosition);

        // 更新蛇头的位置（基于方向和网格大小）
        const gridSize = 24; // 网格大小（像素）
        let { x, y } = headPosition;

        if (this.direction === Direction.RIGHT) {
            x += gridSize;
        } else if (this.direction === Direction.LEFT) {
            x -= gridSize;
        } else if (this.direction === Direction.UP) {
            y += gridSize;
        } else if (this.direction === Direction.DOWN) {
            y -= gridSize;
        }
        this.node.setPosition(x, y);
    }


    updateHeadSprite() {
        const sprite = this.node.getComponent(Sprite);
        if (!sprite) {
            console.error("Snake head node does not have a Sprite component.");
            return;
        }

        // 根据方向设置图片
        switch (this.direction) {
            case Direction.RIGHT:
                sprite.spriteFrame = this.headSprites[0]; // 右
                break;
            case Direction.LEFT:
                sprite.spriteFrame = this.headSprites[1]; // 左
                break;
            case Direction.UP:
                sprite.spriteFrame = this.headSprites[2]; // 上
                break;
            case Direction.DOWN:
                sprite.spriteFrame = this.headSprites[3]; // 下
                break;
        }
    }
}


