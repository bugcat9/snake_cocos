import { _decorator, Component, Node, Vec3, randomRangeInt, Prefab, instantiate } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameControl')
export class GameControl extends Component {
    @property({ type: Node })
    snakeHead: Node | null = null; // 蛇头节点
    gridSize: number = 24; // 网格大小
    gameWidth: number = 1280; // 游戏区域宽度（以网格为单位）
    gameHeight: number = 720; // 游戏区域高度（以网格为单位）

    @property(Prefab)
    food: Prefab;

    start() {
        // this.generateFood();
    }

    update(deltaTime: number) {

    }

    public generateFood() {
        let newPosition: Vec3;
        let isPositionValid = false;

        while (!isPositionValid) {
            // 随机生成一个新的网格位置
            const x = randomRangeInt(-this.gameWidth/2, this.gameWidth/2);
            const y = randomRangeInt(-this.gameHeight/2, this.gameHeight/2);
            newPosition = new Vec3(x, y, 0);

            // 检查新位置是否与蛇体碰撞
            isPositionValid = !this.checkCollisionWithSnake(newPosition);
        }

        // 假设您有一个方法来创建或移动食物节点到指定位置
        this.placeFoodAt(newPosition);
    }

    checkCollisionWithSnake(position: Vec3): boolean {
        // 检查蛇头
        if (this.snakeHead && this.snakeHead.position.equals(position)) {
            return true;
        }
        // 检查蛇身
        // for (let bodyPart of this.snakeBody) {
        //     if (bodyPart.position.equals(position)) {
        //         return true;
        //     }
        // }
        return false;
    }

    placeFoodAt(position: Vec3) {
        // 实现放置食物的方法，这取决于您的具体实现
        // 例如，您可以在这里实例化一个新的Node作为食物，或者更新现有食物节点的位置
        console.log(`Placing food at position: ${position}`);
        if (this.food) {
            const food = instantiate(this.food);
            this.node.addChild(food);
            food.setPosition(position);
        }
    }
}


