import { _decorator, Component, Node, Vec3, randomRangeInt, Prefab, instantiate, BoxCollider2D, PhysicsSystem, Label } from 'cc';
import { GlobalParam } from './GlobalParam';
const { ccclass, property } = _decorator;

@ccclass('GameControl')
export class GameControl extends Component {

    @property(Prefab)
    food: Prefab;

    @property(Prefab)
    body: Prefab;

    @property({type: Label})
    public scoreLabel: Label = null;
    
    score: number = 0;

    start() {
        const body = instantiate(this.body);
        const { x, y } = this.node.getPosition();
        body.setParent(this.node.parent);
        body.setPosition(x - 24, y);
        GlobalParam.getInstance().snakeBody.push(body);
        this.node.parent.addChild(body);
        this.generateFood();
        this.scoreLabel.string = 'Score:' + this.score;
    }

    update(deltaTime: number) {

    }

    public growSnake() {
        let tailNode = GlobalParam.getInstance().snakeBody[GlobalParam.getInstance().snakeBody.length - 1];
        let newTailPosition = tailNode.getPosition(); // 需要根据实际情况确定新节的位置

        // 创建新节点并设置其位置
        const body = instantiate(this.body);
        body.setParent(this.node.parent);
        body.setPosition(newTailPosition.x - 24, newTailPosition.y);

        // 将新节点添加到场景和snakeBody数组中
        GlobalParam.getInstance().snakeBody.push(body);
        this.node.parent.addChild(body);
        
        this.score++;
        this.scoreLabel.string = 'Score:' + this.score;

        // 延迟创建新食物节点
        this.scheduleOnce(() => {
            this.generateFood();
        }, 0);
    }


    public generateFood() {
        let newPosition: Vec3;
        let isPositionValid = false;

        while (!isPositionValid) {
            // 随机生成一个新的网格位置
            const x = randomRangeInt(-GlobalParam.getInstance().gameWidth / 2 + 50, GlobalParam.getInstance().gameWidth / 2 - 50);
            const y = randomRangeInt(-GlobalParam.getInstance().gameHeight / 2 + 50, GlobalParam.getInstance().gameHeight / 2 - 50);
            newPosition = new Vec3(x, y, 0);

            // 检查新位置是否与蛇体碰撞
            isPositionValid = !this.checkCollisionWithSnake(newPosition);
        }

        console.log(`Placing food at position: ${newPosition}`);
        if (this.food) {
            const newFood = instantiate(this.food);
            const foodCollider = newFood.getComponent(BoxCollider2D);
            if (foodCollider) {
                console.log("Food collider enabled:", foodCollider.enabled);
            } else {
                console.error("Food prefab does not have a BoxCollider2D component.");
            }
            this.node.addChild(newFood);
            newFood.setPosition(newPosition);
        }
    }

    checkCollisionWithSnake(position: Vec3): boolean {
        // 检查蛇头
        if (GlobalParam.getInstance().snakeHead && GlobalParam.getInstance().snakeHead.position.equals(position)) {
            return true;
        }
        // 检查蛇身
        for (let bodyPart of GlobalParam.getInstance().snakeBody) {
            if (bodyPart.position.equals(position)) {
                return true;
            }
        }
        return false;
    }
}


