import { Node } from 'cc';

export class GlobalParam {
    private static _instance: GlobalParam;

    // 全局参数
    snakeBody: Node[] = [];
    snakeHead: Node | null = null;
    gridSize: number = 24; // 网格大小
    gameWidth: number = 1280; // 游戏区域宽度（以网格为单位）
    gameHeight: number = 720; // 游戏区域高度（以网格为单位）
    score: number = 0;

    // 单例模式：获取实例
    public static getInstance(): GlobalParam {
        if (!GlobalParam._instance) {
            GlobalParam._instance = new GlobalParam();
        }
        return GlobalParam._instance;
    }


    public resetGame() {
        this.snakeBody = [];
        this.score = 0;
    }
    // 私有构造函数，防止外部实例化
    private constructor() { }
}