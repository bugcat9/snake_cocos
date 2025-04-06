import { _decorator, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MenuControl')
export class MenuControl extends Component {
    onStartButtonClicked() {
        // 切换到名为 "GameScene" 的场景
        director.loadScene('Main');
    }
}


