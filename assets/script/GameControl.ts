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
        const snakeBody = GlobalParam.getInstance().snakeBody;
        const tailNode = snakeBody[snakeBody.length - 1];
        const tailPos = tailNode.getPosition();

        // 新尾节应紧贴当前尾部延伸。方向 = 尾部 - 前驱，保证每节间隔 24px
        // 1 节身体时：前驱是头；2 节以上时：前驱是倒数第二节
        const referencePos = snakeBody.length >= 2
            ? snakeBody[snakeBody.length - 2].getPosition()
            : GlobalParam.getInstance().snakeHead!.position;
        const dx = tailPos.x - referencePos.x;
        const dy = tailPos.y - referencePos.y;
        const newTailX = tailPos.x + dx;
        const newTailY = tailPos.y + dy;

        // 创建新节点并设置其位置
        const body = instantiate(this.body);
        body.setParent(this.node.parent);
        body.setPosition(newTailX, newTailY);

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


    /**
     * 将世界坐标转换为网格坐标（网格大小为 gridSize）
     */
    private worldToGrid(x: number, y: number): { gx: number, gy: number } {
        const gridSize = GlobalParam.getInstance().gridSize;
        const gx = Math.round(x / gridSize);
        const gy = Math.round(y / gridSize);
        return { gx, gy };
    }

    /**
     * 将网格坐标转换为世界坐标（网格中心点）
     */
    private gridToWorld(gx: number, gy: number): Vec3 {
        const gridSize = GlobalParam.getInstance().gridSize;
        return new Vec3(gx * gridSize, gy * gridSize, 0);
    }

    /**
     * 获取当前所有已被占用的网格集合（蛇头、蛇身、已有食物）
     */
    private getOccupiedGridSet(): Set<string> {
        const occupied = new Set<string>();
        const gridSize = GlobalParam.getInstance().gridSize;

        // 添加蛇头
        if (GlobalParam.getInstance().snakeHead) {
            const pos = GlobalParam.getInstance().snakeHead.position;
            const { gx, gy } = this.worldToGrid(pos.x, pos.y);
            occupied.add(`${gx},${gy}`);
        }

        // 添加蛇身
        for (const bodyPart of GlobalParam.getInstance().snakeBody) {
            const pos = bodyPart.position;
            const { gx, gy } = this.worldToGrid(pos.x, pos.y);
            occupied.add(`${gx},${gy}`);
        }

        return occupied;
    }

    /**
     * 获取游戏区域内所有可用的网格位置（对齐网格，排除边界）
     */
    private getAvailableGridPositions(excludeGrids: Set<string>): { gx: number, gy: number }[] {
        const gridSize = GlobalParam.getInstance().gridSize;
        const margin = 50; // 距离边界的留白
        const halfWidth = GlobalParam.getInstance().gameWidth / 2;
        const halfHeight = GlobalParam.getInstance().gameHeight / 2;

        // 计算网格索引范围（与蛇的移动网格一致）
        const minGx = Math.ceil((-halfWidth + margin) / gridSize);
        const maxGx = Math.floor((halfWidth - margin) / gridSize);
        const minGy = Math.ceil((-halfHeight + margin) / gridSize);
        const maxGy = Math.floor((halfHeight - margin) / gridSize);

        const available: { gx: number, gy: number }[] = [];
        for (let gx = minGx; gx <= maxGx; gx++) {
            for (let gy = minGy; gy <= maxGy; gy++) {
                const key = `${gx},${gy}`;
                if (!excludeGrids.has(key)) {
                    available.push({ gx, gy });
                }
            }
        }
        return available;
    }

    public generateFood() {
        let word = this.words[this.indexInWords].word;
        this.wordLabel.string = this.words[this.indexInWords].word + ' - ' + this.words[this.indexInWords].definition;
        this.indexInWord = 0; // 重置单词索引

        // 基于网格的占用集合，保证食物与蛇身、食物之间永不重叠
        const occupiedGrids = this.getOccupiedGridSet();

        for (const char of word) {
            const available = this.getAvailableGridPositions(occupiedGrids);

            if (available.length === 0) {
                console.warn("没有足够空间放置食物，跳过该字符:", char);
                continue;
            }

            // 随机选取一个可用网格
            const idx = randomRangeInt(0, available.length);
            const { gx, gy } = available[idx];
            const newPosition = this.gridToWorld(gx, gy);

            if (this.food) {
                const newFood = instantiate(this.food);
                this.node.addChild(newFood);
                newFood.setPosition(newPosition);
                const foodComponent = newFood.getComponent(FoodControl);

                if (foodComponent) {
                    foodComponent.setSpriteFrame(char);
                }

                // 将新食物位置加入占用集合，避免同一单词内多个食物重叠
                occupiedGrids.add(`${gx},${gy}`);
            }
        }
        this.indexInWords = (this.indexInWords + 1) % this.words.length; // 循环使用单词列表
    }

    public gameover() {
        /**
         * 游戏结束，切换场景
         */
        console.log("游戏结束");

        director.loadScene("GameOver");
    }
}


