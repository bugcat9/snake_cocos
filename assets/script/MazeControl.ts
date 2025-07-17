import { _decorator, Component, instantiate, Node, Prefab, resources, Sprite, SpriteFrame, Vec3 } from 'cc';
import { GlobalParam } from './GlobalParam';
const { ccclass, property } = _decorator;

@ccclass('MazeControl')
export class MazeControl extends Component {
    @property(Prefab)
    wall: Prefab;

    onLoad() {
        this.generateWalls(GlobalParam.getInstance().gameWidth, GlobalParam.getInstance().gameHeight, GlobalParam.getInstance().gridSize);
    }

    generateWalls(sceneWidth: number, sceneHeight: number, wallSize: number) {
        const halfSceneWidth = sceneWidth / 2;
        const halfSceneHeight = sceneHeight / 2;

        // Top and bottom walls
        for (let x = -halfSceneWidth; x < halfSceneWidth; x += wallSize) {
            this.placeWall(x, halfSceneHeight - wallSize / 2, wallSize); // Top wall
            this.placeWall(x, -halfSceneHeight - wallSize, wallSize); // Bottom wall
        }

        // Left and right walls
        for (let y = -halfSceneHeight; y < halfSceneHeight; y += wallSize) {
            this.placeWall(-halfSceneWidth + wallSize / 2, y, wallSize); // Left wall
            this.placeWall(halfSceneWidth - wallSize / 2, y, wallSize); // Right wall
        }
    }

    placeWall(x: number, y: number, size: number) {
        if (this.wall) {
            const newWall = instantiate(this.wall);
            newWall.setParent(this.node.parent);
            newWall.setPosition(new Vec3(x, y, 0));
        }
    }
}


