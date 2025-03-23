import { _decorator, Component, Node, Animation, EventKeyboard, input, Input, KeyCode, Prefab, instantiate, Collider2D, Contact2DType, Vec3, randomRangeInt, Sprite, SpriteFrame } from 'cc';
import { GameControl } from './GameControl';
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

    private gridSize: number = 24; // 网格大小
    private gameWidth: number = 1280; // 游戏区域宽度（以网格为单位）
    private gameHeight: number = 720; // 游戏区域高度（以网格为单位）

    @property({ type: Node })
    gameMgr: Node | null = null; // 游戏管理节点
    // @property(Animation)
    // anim: Animation | null = null;

    @property(Prefab)
    body: Prefab;
    @property(Prefab)
    food: Prefab;
    @property({ type: [SpriteFrame] })
    headSprites: SpriteFrame[] = []; // 方向对应的图片资源
    private snakeBody: Node[] = [];

    protected onLoad(): void {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.BEGIN_CONTACT, this.growSnake, this);
        }
        const body = instantiate(this.body);
        const { x, y } = this.node.getPosition();
        body.setParent(this.node.parent);
        body.setPosition(x - 24, y);
        this.snakeBody.push(body);
        this.node.parent.addChild(body);
        this.generateFood();
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
        // if (this.anim) {
        //     this.anim.play('animation'); // 替换为您的动画剪辑名称
        // }else{
        //     console.error('Animation component not found on the node.');
        // }
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

    private growSnake() {
        let tailNode = this.snakeBody[this.snakeBody.length - 1];
        let newTailPosition = tailNode.getPosition(); // 需要根据实际情况确定新节的位置

        // 创建新节点并设置其位置
        const body = instantiate(this.body);
        body.setParent(this.node.parent);
        body.setPosition(newTailPosition.x - 24, newTailPosition.y);

        // 将新节点添加到场景和snakeBody数组中
        this.snakeBody.push(body);
        this.node.parent.addChild(body);


        // 延迟创建新食物节点
        this.scheduleOnce(() => {
            this.generateFood();
        }, 0);
    }

    checkCollisionWithSnake(position: Vec3): boolean {
        // 检查蛇头
        if (this.node && this.node.position.equals(position)) {
            return true;
        }
        // 检查蛇身
        for (let bodyPart of this.snakeBody) {
            if (bodyPart.position.equals(position)) {
                return true;
            }
        }
        return false;
    }

    placeFoodAt(position: Vec3) {
        // 实现放置食物的方法，这取决于您的具体实现
        // 例如，您可以在这里实例化一个新的Node作为食物，或者更新现有食物节点的位置
        console.log(`Placing food at position: ${position}`);
        if (this.food) {
            const food = instantiate(this.food);
            food.setPosition(position);
            food.setParent(this.node.parent);
        }
    }

    public generateFood() {
        let newPosition: Vec3;
        let isPositionValid = false;

        while (!isPositionValid) {
            // 随机生成一个新的网格位置
            const x = randomRangeInt(-this.gameWidth / 2, this.gameWidth / 2);
            const y = randomRangeInt(-this.gameHeight / 2, this.gameHeight / 2);
            newPosition = new Vec3(x, y, 0);

            // 检查新位置是否与蛇体碰撞
            isPositionValid = !this.checkCollisionWithSnake(newPosition);
        }

        // 假设您有一个方法来创建或移动食物节点到指定位置
        this.placeFoodAt(newPosition);
    }

    moveSnake(deltaTime: number) {
        // 保存蛇头的当前位置
        const headPosition = this.node.getPosition();

        // 更新蛇身的位置（从尾部到头部依次更新）
        for (let i = this.snakeBody.length - 1; i > 0; i--) {
            this.snakeBody[i].setPosition(this.snakeBody[i - 1].position);
        }

        // 蛇身的第一个部分跟随蛇头的当前位置
        this.snakeBody[0].setPosition(headPosition);

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


