import { _decorator, Component, resources, Sprite, SpriteAtlas } from 'cc';
const { ccclass } = _decorator;

@ccclass('FoodControl')
export class FoodControl extends Component {
    private static atlas: SpriteAtlas | null = null;
    private static isLoadingAtlas = false;
    private static pendingAtlasTasks: Array<() => void> = [];

    isDead: boolean = false;
    word: string = '';

    die() {
        if (this.isDead) {
            return;
        }

        this.isDead = true;
        this.scheduleOnce(() => {
            if (this.node.isValid) {
                this.node.destroy();
            }
        }, 0);
    }

    setSpriteFrame(word: string) {
        this.word = word;
        const sprite = this.getComponent(Sprite);
        if (!sprite) {
            return;
        }

        const frameName = `Apple${word}`;
        this.withAtlas((atlas) => {
            const frame = atlas.getSpriteFrame(frameName);
            if (!frame) {
                console.warn(`Missing sprite frame: ${frameName}`);
                return;
            }

            if (this.node.isValid) {
                sprite.spriteFrame = frame;
            }
        });
    }

    private withAtlas(callback: (atlas: SpriteAtlas) => void) {
        if (FoodControl.atlas) {
            callback(FoodControl.atlas);
            return;
        }

        FoodControl.pendingAtlasTasks.push(() => {
            if (FoodControl.atlas) {
                callback(FoodControl.atlas);
            }
        });

        if (FoodControl.isLoadingAtlas) {
            return;
        }

        FoodControl.isLoadingAtlas = true;
        resources.load('apple', SpriteAtlas, (err, atlas) => {
            FoodControl.isLoadingAtlas = false;

            if (err || !atlas) {
                console.error('Failed to load apple atlas', err);
                FoodControl.pendingAtlasTasks.length = 0;
                return;
            }

            FoodControl.atlas = atlas;
            const tasks = FoodControl.pendingAtlasTasks.splice(0);
            for (const task of tasks) {
                task();
            }
        });
    }
}
