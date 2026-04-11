import { _decorator, Component, JsonAsset, Label, Prefab, Vec3, director, instantiate, randomRangeInt } from 'cc';
import { AudioMgr } from './AudioMgr';
import { FoodControl } from './FoodControl';
import { GlobalParam } from './GlobalParam';

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
    indexInWords: number = 0;
    indexInWord: number = 0;

    protected onLoad(): void {
        const globalParam = GlobalParam.getInstance();
        globalParam.resetGame();

        const body = instantiate(this.body);
        const { x, y } = this.node.getPosition();
        body.setParent(this.node.parent);
        body.setPosition(x - globalParam.gridSize, y);
        globalParam.snakeBody.push(body);

        this.scoreLabel.string = 'Score:' + globalParam.score;
        this.words = this.wordJson.json as WordDefinition[];
        this.generateFood();
    }

    public headAndFoodContact(word: string) {
        const currentWord = this.getCurrentWord();
        if (!currentWord) {
            return;
        }

        if (word !== currentWord.word[this.indexInWord]) {
            AudioMgr.inst.playOneShot('audio/Die');
            this.gameover();
            return;
        }

        AudioMgr.inst.playOneShot('audio/Eat');

        const globalParam = GlobalParam.getInstance();
        const snakeBody = globalParam.snakeBody;
        const tailNode = snakeBody[snakeBody.length - 1];
        const tailPos = tailNode.getPosition();
        const referencePos = snakeBody.length >= 2
            ? snakeBody[snakeBody.length - 2].getPosition()
            : globalParam.snakeHead!.position;

        const body = instantiate(this.body);
        body.setParent(this.node.parent);
        body.setPosition(tailPos.x + (tailPos.x - referencePos.x), tailPos.y + (tailPos.y - referencePos.y));
        snakeBody.push(body);

        globalParam.score++;
        this.scoreLabel.string = 'Score:' + globalParam.score;
        this.indexInWord++;

        if (this.indexInWord === currentWord.word.length) {
            this.indexInWord = 0;
            this.scheduleOnce(() => {
                this.generateFood();
            }, 0);
        }
    }

    private worldToGrid(x: number, y: number): { gx: number, gy: number } {
        const gridSize = GlobalParam.getInstance().gridSize;
        return {
            gx: Math.round(x / gridSize),
            gy: Math.round(y / gridSize),
        };
    }

    private gridToWorld(gx: number, gy: number): Vec3 {
        const gridSize = GlobalParam.getInstance().gridSize;
        return new Vec3(gx * gridSize, gy * gridSize, 0);
    }

    private getOccupiedGridSet(): Set<string> {
        const globalParam = GlobalParam.getInstance();
        const occupied = new Set<string>();

        if (globalParam.snakeHead) {
            const pos = globalParam.snakeHead.position;
            const { gx, gy } = this.worldToGrid(pos.x, pos.y);
            occupied.add(`${gx},${gy}`);
        }

        for (const bodyPart of globalParam.snakeBody) {
            const pos = bodyPart.position;
            const { gx, gy } = this.worldToGrid(pos.x, pos.y);
            occupied.add(`${gx},${gy}`);
        }

        return occupied;
    }

    private getAvailableGridPositions(excludeGrids: Set<string>): { gx: number, gy: number }[] {
        const globalParam = GlobalParam.getInstance();
        const gridSize = globalParam.gridSize;
        const margin = 50;
        const halfWidth = globalParam.gameWidth / 2;
        const halfHeight = globalParam.gameHeight / 2;

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
        if (this.words.length === 0) {
            console.warn('No words configured in wordJson');
            return;
        }

        const wordEntry = this.words[this.indexInWords];
        this.wordLabel.string = `${wordEntry.word} - ${wordEntry.definition}`;
        this.indexInWord = 0;

        const occupiedGrids = this.getOccupiedGridSet();
        for (const char of wordEntry.word) {
            const available = this.getAvailableGridPositions(occupiedGrids);
            if (available.length === 0) {
                console.warn(`No space left to place food for: ${char}`);
                continue;
            }

            const idx = randomRangeInt(0, available.length);
            const { gx, gy } = available[idx];
            const newFood = instantiate(this.food);
            this.node.addChild(newFood);
            newFood.setPosition(this.gridToWorld(gx, gy));

            const foodComponent = newFood.getComponent(FoodControl);
            if (foodComponent) {
                foodComponent.setSpriteFrame(char);
            }

            occupiedGrids.add(`${gx},${gy}`);
        }

        this.indexInWords = (this.indexInWords + 1) % this.words.length;
    }

    public gameover() {
        director.loadScene('GameOver');
    }

    private getCurrentWord(): WordDefinition | null {
        if (this.words.length === 0) {
            return null;
        }

        const currentIndex = (this.indexInWords - 1 + this.words.length) % this.words.length;
        return this.words[currentIndex];
    }
}
