    import { _decorator, Component, instantiate, Node, Prefab, resources, Sprite, SpriteFrame, Vec3 } from 'cc';
    const { ccclass, property } = _decorator;

    @ccclass('MazeControl')
    export class MazeControl extends Component {
        @property(Prefab)
        wall: Prefab;

        onLoad(){
            this.generateWalls(1280, 720, 24);
            // const node = instantiate(this.wall);
            // node.setParent(this.node.parent);
            // node.setPosition(0, -10);
            // resources.load('snake/snake-19', SpriteFrame, (err: any, spriteFrame) => {
            //     if (err) {
            //         console.error('Failed to load SpriteFrame:', err);
            //         return;
            //     }
            //     const sprite = node.getComponent(Sprite);
            //     if (sprite) {
            //         sprite.spriteFrame = spriteFrame;
            //     } else {
            //         console.error('Sprite component not found on the node.');
            //     }
            // });
        }
        
        generateWalls(sceneWidth: number, sceneHeight: number, wallSize: number) {
            const halfSceneWidth = sceneWidth / 2;
            const halfSceneHeight = sceneHeight / 2;
    
            // Top and bottom walls
            for (let x = -halfSceneWidth; x < halfSceneWidth; x += wallSize) {
                this.placeWall(x, halfSceneHeight - wallSize / 2, wallSize); // Top wall
                this.placeWall(x, -halfSceneHeight + wallSize / 2, wallSize); // Bottom wall
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


