import { _decorator, Component, director, Label, Node } from 'cc';
import { GlobalParam } from './GlobalParam';
const { ccclass, property } = _decorator;

@ccclass('GameOverControl')
export class GameOverControl extends Component {

    @property({ type: Label })
    public scoreLabel: Label = null;

    protected onLoad(): void {
        // 获取全局参数实例
        const globalParam = GlobalParam.getInstance();
        // 设置分数标签的文本
        this.scoreLabel.string = 'Your Score: ' + globalParam.score;
    }
    
    start() {

    }

    update(deltaTime: number) {
        
    }

    onStartButtonClicked() {
        // 切换到名为 "GameScene" 的场景
        director.loadScene('Main');
    }
}


