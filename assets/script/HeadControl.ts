import { _decorator, Component, Node, EventKeyboard, input, Input, KeyCode, Collider2D, Contact2DType, Sprite, SpriteFrame, IPhysics2DContact,Animation } from 'cc';
import { GameControl } from './GameControl';
import { GlobalParam } from './GlobalParam';
import { FoodControl } from './FoodControl';
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

    private isGameover = false; // 游戏是否结束

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
        this.direction = Direction.RIGHT; // 初始化方向为右
        this.isGameover = false; // 初始化游戏状态为未结束
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        // 只在两个碰撞体开始接触时被调用一次
        console.log('onBeginContact');
        if (otherCollider.node.name === 'Food') {
            console.log("吃到食物了");
            let w = otherCollider.getComponent(FoodControl).word;
            otherCollider.getComponent(FoodControl).die();
            this.gameMgr?.getComponent(GameControl)?.headAndFoodContact(w);

        } else if (otherCollider.node.name === 'Maze') {
            console.log("撞墙了");
            if (!this.isGameover) {
                this.isGameover = true; // 设置游戏结束状态
                this.gameMgr?.getComponent(GameControl)?.gameover();
            }
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
        // 添加 Animation 组件
        const animationComponent = this.node.getComponent(Animation);
        animationComponent.play('snakeHeadRight'); // 播放默认动画
    }

    update(deltaTime: number) {
        this.elapsedTime += deltaTime;
        if (this.elapsedTime >= this.flipInterval) {
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
        // 根据方向设置图片
        switch (this.direction) {
            case Direction.RIGHT:
                {
                    // 播放动画
                    const animationComponent = this.node.getComponent(Animation);
                    if (animationComponent) {
                        animationComponent.stop();
                        animationComponent.play('snakeHeadRight');
                    }
                }
                break;
            case Direction.LEFT:
                {
                    // 播放动画
                    const animationComponent = this.node.getComponent(Animation);
                    if (animationComponent) {
                        animationComponent.stop();
                        animationComponent.play('snakeHeadLeft');
                    }
                }
                break;
            case Direction.UP:
                {
                    const animationComponent = this.node.getComponent(Animation);
                    if (animationComponent) {
                        animationComponent.stop();
                        animationComponent.play('snakeHeadUP');
                    }
                }
                break;
            case Direction.DOWN:
                {
                    const animationComponent = this.node.getComponent(Animation);
                    if (animationComponent) {
                        animationComponent.stop();
                        animationComponent.play('snakeHeadDown');
                    }
                }
                break;
        }
    }
}


