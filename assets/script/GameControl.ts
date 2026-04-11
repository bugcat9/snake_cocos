import { _decorator, Component, JsonAsset, Label, Node, NodePool, Prefab, Vec3, director, instantiate, randomRangeInt } from 'cc';
import { AudioMgr } from './AudioMgr';
import { FoodControl } from './FoodControl';
import { GlobalParam } from './GlobalParam';
import { GameState } from './GameState';

const { ccclass, property } = _decorator;

interface WordDefinition {
    word: string;
    definition: string;
}

@ccclass('GameControl')
export class GameControl extends Component {
    private static readonly foodPool = new NodePool('FoodControl');
    private static readonly bodyPool = new NodePool();

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
    private state: GameState = GameState.Initializing;
    private activeWord: WordDefinition | null = null;
    private readonly activeFoodNodes = new Set<Node>();

    protected onLoad(): void {
        const globalParam = GlobalParam.getInstance();
        globalParam.resetGame();
        this.unscheduleAllCallbacks();
        this.activeWord = null;
        this.indexInWords = 0;
        this.indexInWord = 0;
        this.state = GameState.Initializing;

        const body = this.acquireBodyNode();
        const { x, y } = this.node.getPosition();
        body.setParent(this.node.parent);
        body.setPosition(x - globalParam.gridSize, y);
        globalParam.snakeBody.push(body);

        this.scoreLabel.string = 'Score:' + globalParam.score;
        this.words = this.normalizeWords(this.wordJson.json as WordDefinition[]);
    }

    start() {
        this.startNextRound();
    }

    protected onDestroy(): void {
        this.state = GameState.Transitioning;
        this.unscheduleAllCallbacks();
        for (const foodNode of Array.from(this.activeFoodNodes)) {
            this.releaseFoodNode(foodNode);
        }

        const globalParam = GlobalParam.getInstance();
        for (const bodyNode of globalParam.snakeBody) {
            this.releaseBodyNode(bodyNode);
        }

        globalParam.snakeBody = [];
        globalParam.snakeHead = null;
    }

    public headAndFoodContact(word: string) {
        if (!this.canAcceptCollisions() || !this.activeWord) {
            return;
        }

        if (word !== this.activeWord.word[this.indexInWord]) {
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

        const body = this.acquireBodyNode();
        body.setParent(this.node.parent);
        body.setPosition(tailPos.x + (tailPos.x - referencePos.x), tailPos.y + (tailPos.y - referencePos.y));
        snakeBody.push(body);

        globalParam.score++;
        this.scoreLabel.string = 'Score:' + globalParam.score;
        this.indexInWord++;

        if (this.indexInWord === this.activeWord.word.length) {
            this.indexInWord = 0;
            this.state = GameState.Transitioning;
            this.scheduleOnce(() => {
                this.startNextRound();
            }, 0);
        }
    }

    public handleMazeCollision() {
        if (!this.canAcceptCollisions()) {
            return;
        }

        AudioMgr.inst.playOneShot('audio/Die');
        this.gameover();
    }

    public isPlaying(): boolean {
        return this.state === GameState.Playing;
    }

    public canAcceptCollisions(): boolean {
        return this.state === GameState.Playing;
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

    public gameover() {
        if (this.state === GameState.GameOver) {
            return;
        }

        this.state = GameState.GameOver;
        this.unscheduleAllCallbacks();
        this.clearActiveFoods();
        director.loadScene('GameOver');
    }

    private startNextRound() {
        if (this.state === GameState.GameOver) {
            return;
        }

        this.clearActiveFoods();

        const wordEntry = this.pickNextPlayableWord();
        if (!wordEntry) {
            console.warn('No playable word could be generated with the remaining space.');
            this.gameover();
            return;
        }

        this.activeWord = wordEntry;
        this.indexInWord = 0;
        this.wordLabel.string = `${wordEntry.word} - ${wordEntry.definition}`;
        this.spawnFoodForWord(wordEntry.word);
        this.state = GameState.Playing;
    }

    private pickNextPlayableWord(): WordDefinition | null {
        if (this.words.length === 0) {
            return null;
        }

        const availableCount = this.getAvailableGridPositions(this.getOccupiedGridSet()).length;
        if (availableCount <= 0) {
            return null;
        }

        for (let offset = 0; offset < this.words.length; offset++) {
            const candidateIndex = (this.indexInWords + offset) % this.words.length;
            const candidate = this.words[candidateIndex];
            if (candidate.word.length <= availableCount) {
                this.indexInWords = (candidateIndex + 1) % this.words.length;
                return candidate;
            }
        }

        return null;
    }

    private spawnFoodForWord(word: string) {
        const occupiedGrids = this.getOccupiedGridSet();
        for (const char of word) {
            const available = this.getAvailableGridPositions(occupiedGrids);
            if (available.length === 0) {
                console.warn(`No space left to place food for: ${char}`);
                break;
            }

            const idx = randomRangeInt(0, available.length);
            const { gx, gy } = available[idx];
            const newFood = this.acquireFoodNode(char);
            this.node.addChild(newFood);
            newFood.setPosition(this.gridToWorld(gx, gy));
            occupiedGrids.add(`${gx},${gy}`);
        }
    }

    private clearActiveFoods() {
        for (const foodNode of Array.from(this.activeFoodNodes)) {
            this.releaseFoodNode(foodNode);
        }
    }

    private normalizeWords(rawWords: WordDefinition[]): WordDefinition[] {
        const normalizedWords: WordDefinition[] = [];
        const seen = new Set<string>();

        for (const entry of rawWords ?? []) {
            const word = entry?.word?.trim().toLowerCase();
            const definition = entry?.definition?.trim();
            if (!word || !definition || !/^[a-z]+$/.test(word) || seen.has(word)) {
                continue;
            }

            seen.add(word);
            normalizedWords.push({ word, definition });
        }

        return normalizedWords;
    }

    private acquireFoodNode(word: string): Node {
        const foodNode = GameControl.foodPool.get() ?? instantiate(this.food);
        const foodControl = foodNode.getComponent(FoodControl);
        if (foodControl) {
            foodControl.setup(word, () => {
                this.releaseFoodNode(foodNode);
            });
        }

        this.activeFoodNodes.add(foodNode);
        return foodNode;
    }

    private releaseFoodNode(foodNode: Node) {
        if (!foodNode.isValid) {
            return;
        }

        const foodControl = foodNode.getComponent(FoodControl);
        foodControl?.resetForPool();
        this.activeFoodNodes.delete(foodNode);
        foodNode.removeFromParent();
        foodNode.active = false;
        GameControl.foodPool.put(foodNode);
    }

    private acquireBodyNode(): Node {
        const bodyNode = GameControl.bodyPool.get() ?? instantiate(this.body);
        bodyNode.active = true;
        return bodyNode;
    }

    private releaseBodyNode(bodyNode: Node) {
        if (!bodyNode.isValid) {
            return;
        }

        bodyNode.removeFromParent();
        bodyNode.active = false;
        GameControl.bodyPool.put(bodyNode);
    }
}
