import { _decorator, Animation, Collider2D, Component, Contact2DType, EventKeyboard, IPhysics2DContact, Input, KeyCode, Node, input } from 'cc';
import { FoodControl } from './FoodControl';
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
    private readonly moveInterval = 0.5;
    private elapsedTime = 0;
    private direction = Direction.RIGHT;
    private queuedDirection: Direction | null = null;
    private animationComponent: Animation | null = null;
    private collider: Collider2D | null = null;
    private gameControl: GameControl | null = null;

    @property({ type: Node })
    gameMgr: Node | null = null;

    protected onLoad(): void {
        this.elapsedTime = 0;
        this.direction = Direction.RIGHT;
        this.queuedDirection = null;
        GlobalParam.getInstance().snakeHead = this.node;
        this.gameControl = this.gameMgr?.getComponent(GameControl) ?? null;
        this.animationComponent = this.node.getComponent(Animation);

        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);

        this.collider = this.getComponent(Collider2D);
        if (this.collider) {
            this.collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
        }
    }

    protected onDestroy(): void {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
        this.collider?.off(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
    }

    start() {
        this.playDirectionAnimation();
    }

    update(deltaTime: number) {
        if (!this.gameControl?.isPlaying()) {
            return;
        }

        this.elapsedTime += deltaTime;
        if (this.elapsedTime >= this.moveInterval) {
            this.elapsedTime -= this.moveInterval;
            this.moveSnake();
        }
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (!this.gameControl?.canAcceptCollisions()) {
            return;
        }

        if (otherCollider.node.name === 'Food') {
            const food = otherCollider.getComponent(FoodControl);
            if (!food) {
                return;
            }

            const word = food.word;
            food.die();
            this.gameControl?.headAndFoodContact(word);
            return;
        }

        if (otherCollider.node.name === 'Maze') {
            this.gameControl.handleMazeCollision();
        }
    }

    onKeyDown(event: EventKeyboard) {
        if (!this.gameControl?.isPlaying()) {
            return;
        }

        switch (event.keyCode) {
            case KeyCode.ARROW_UP:
                this.tryChangeDirection(Direction.UP, Direction.DOWN);
                break;
            case KeyCode.ARROW_DOWN:
                this.tryChangeDirection(Direction.DOWN, Direction.UP);
                break;
            case KeyCode.ARROW_LEFT:
                this.tryChangeDirection(Direction.LEFT, Direction.RIGHT);
                break;
            case KeyCode.ARROW_RIGHT:
                this.tryChangeDirection(Direction.RIGHT, Direction.LEFT);
                break;
            default:
                break;
        }
    }

    private moveSnake() {
        const globalParam = GlobalParam.getInstance();

        if (this.queuedDirection !== null) {
            this.direction = this.queuedDirection;
            this.queuedDirection = null;
            this.playDirectionAnimation();
        }

        const headPosition = this.node.getPosition();
        const snakeBody = globalParam.snakeBody;

        for (let i = snakeBody.length - 1; i > 0; i--) {
            snakeBody[i].setPosition(snakeBody[i - 1].position);
        }

        if (snakeBody.length > 0) {
            snakeBody[0].setPosition(headPosition);
        }

        const gridSize = globalParam.gridSize;
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

    private tryChangeDirection(nextDirection: Direction, blockedDirection: Direction) {
        const currentDirection = this.queuedDirection ?? this.direction;
        if (currentDirection === blockedDirection || currentDirection === nextDirection) {
            return;
        }

        this.queuedDirection = nextDirection;
    }

    private playDirectionAnimation() {
        if (!this.animationComponent) {
            return;
        }

        switch (this.direction) {
            case Direction.RIGHT:
                this.animationComponent.play('snakeHeadRight');
                break;
            case Direction.LEFT:
                this.animationComponent.play('snakeHeadLeft');
                break;
            case Direction.UP:
                this.animationComponent.play('snakeHeadUP');
                break;
            case Direction.DOWN:
                this.animationComponent.play('snakeHeadDown');
                break;
        }
    }
}
