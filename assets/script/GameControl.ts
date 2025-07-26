import { _decorator, Component, Vec3, randomRangeInt, Prefab, instantiate, BoxCollider2D, Label, JsonAsset, resources, director } from 'cc';
import { GlobalParam } from './GlobalParam';
import { FoodControl } from './FoodControl';
import { AudioMgr } from './AudioMgr';
const { ccclass, property } = _decorator;

interface WordDefinition {
    word: string;
    definition: string;
}

@ccclass('GameControl')
export class GameControl extends Component {

    @property(Prefab)
    food: Prefab;

    @property(Prefab)
    body: Prefab;

    @property({ type: Label })
    public scoreLabel: Label = null;

    @property({ type: Label })
    public wordLabel: Label = null;

    @property(JsonAsset)
    wordJson: JsonAsset = null!;

    words: WordDefinition[] = [];
    indexInWords: number = 0;  // words 数组的索引
    indexInWord: number = 0; // words[indexInWords].word 的索引

    protected onLoad(): void {
        GlobalParam.getInstance().resetGame();
        const body = instantiate(this.body);
        const { x, y } = this.node.getPosition();
        body.setParent(this.node.parent);
        body.setPosition(x - 24, y);
        GlobalParam.getInstance().snakeBody.push(body);
        this.node.parent.addChild(body);
        this.scoreLabel.string = 'Score:' + GlobalParam.getInstance().score;
        this.words = this.wordJson.json as WordDefinition[];
        this.generateFood();
    }

    start() {

    }

    update(deltaTime: number) {

    }

    public headAndFoodContact(w: string) {
        if (w !== this.words[this.indexInWords - 1].word[this.indexInWord]) {
            AudioMgr.inst.playOneShot('audio/Die'); // 播放吃食物音效
            console.log("吃到错误的食物，游戏结束");
            this.gameover();
            return;
        }

        AudioMgr.inst.playOneShot('audio/Eat'); // 播放吃食物音效
        let tailNode = GlobalParam.getInstance().snakeBody[GlobalParam.getInstance().snakeBody.length - 1];
        let newTailPosition = tailNode.getPosition(); // 需要根据实际情况确定新节的位置

        // 创建新节点并设置其位置
        const body = instantiate(this.body);
        body.setParent(this.node.parent);
        body.setPosition(newTailPosition.x - 24, newTailPosition.y);

        // 将新节点添加到场景和snakeBody数组中
        GlobalParam.getInstance().snakeBody.push(body);
        this.node.parent.addChild(body);

        GlobalParam.getInstance().score++;
        this.scoreLabel.string = 'Score:' + GlobalParam.getInstance().score;
        this.indexInWord++;
        if (this.indexInWord == this.words[this.indexInWords].word.length) {
            this.indexInWord = 0; // 重置单词索引
            // 延迟创建新食物节点
            this.scheduleOnce(() => {
                this.generateFood();
            }, 0);
        }
    }


    public generateFood() {
        let word = this.words[this.indexInWords].word;
        this.wordLabel.string = this.words[this.indexInWords].word + ' - ' + this.words[this.indexInWords].definition;
        this.indexInWord = 0; // 重置单词索引

        const minDistance = 50; // 设定最小间隔距离
        const placedPositions: Vec3[] = []; // 已放置食物的位置

        for (const char of word) {
            let newPosition: Vec3;
            let isPositionValid = false;

            const maxTries = 100; // 最大尝试次数，防止死循环
            let tries = 0;

            while (!isPositionValid && tries < maxTries) {
                // 随机生成一个新的网格位置
                const x = randomRangeInt(-GlobalParam.getInstance().gameWidth / 2 + 50, GlobalParam.getInstance().gameWidth / 2 - 50);
                const y = randomRangeInt(-GlobalParam.getInstance().gameHeight / 2 + 50, GlobalParam.getInstance().gameHeight / 2 - 50);
                newPosition = new Vec3(x, y, 0);

                // 检查新位置是否与蛇体碰撞以及与其他食物的距离
                if (!this.checkCollisionWithSnake(newPosition)) {
                    let distanceOk = true;
                    for (const pos of placedPositions) {
                        if (Vec3.distance(pos, newPosition) < minDistance) {
                            distanceOk = false;
                            break;
                        }
                    }

                    isPositionValid = distanceOk;
                }
                tries++;
            }

            if (!isPositionValid) {
                console.warn("无法找到有效位置放置食物");
                continue;
            }

            console.log(`Placing food at position: ${newPosition}`);
            if (this.food) {
                const newFood = instantiate(this.food);
                this.node.addChild(newFood);
                newFood.setPosition(newPosition);
                const foodComponent = newFood.getComponent(FoodControl);

                if (foodComponent) {
                    // 调用你定义的方法
                    foodComponent.setSpriteFrame(char);
                }

                // 记录已放置的食物位置
                placedPositions.push(newPosition.clone());
            }
        }
        this.indexInWords = (this.indexInWords + 1) % this.words.length; // 循环使用单词列表
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

    public gameover() {
        /**
         * 游戏结束，切换场景
         */
        console.log("游戏结束");

        director.loadScene("GameOver");
    }
}


