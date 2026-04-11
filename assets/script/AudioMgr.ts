import { AudioClip, AudioSource, Node, director, resources } from 'cc';

export class AudioMgr {
    private static _inst: AudioMgr;

    public static get inst(): AudioMgr {
        if (this._inst == null) {
            this._inst = new AudioMgr();
        }
        return this._inst;
    }

    private _audioSource: AudioSource;
    private readonly clipCache = new Map<string, AudioClip>();
    private readonly pendingLoads = new Map<string, Array<(clip: AudioClip) => void>>();

    constructor() {
        const audioMgr = new Node();
        audioMgr.name = '__audioMgr__';
        director.getScene().addChild(audioMgr);
        director.addPersistRootNode(audioMgr);
        this._audioSource = audioMgr.addComponent(AudioSource);
    }

    public get audioSource() {
        return this._audioSource;
    }

    playOneShot(sound: AudioClip | string, volume: number = 1.0) {
        if (sound instanceof AudioClip) {
            this._audioSource.playOneShot(sound, volume);
            return;
        }

        this.loadClip(sound, (clip) => {
            this._audioSource.playOneShot(clip, volume);
        });
    }

    play(sound: AudioClip | string, volume: number = 1.0) {
        if (sound instanceof AudioClip) {
            this.playClip(sound, volume);
            return;
        }

        this.loadClip(sound, (clip) => {
            this.playClip(clip, volume);
        });
    }

    stop() {
        this._audioSource.stop();
    }

    pause() {
        this._audioSource.pause();
    }

    resume() {
        this._audioSource.play();
    }

    private playClip(clip: AudioClip, volume: number) {
        this._audioSource.stop();
        this._audioSource.clip = clip;
        this._audioSource.play();
        this.audioSource.volume = volume;
    }

    private loadClip(path: string, callback: (clip: AudioClip) => void) {
        const cached = this.clipCache.get(path);
        if (cached) {
            callback(cached);
            return;
        }

        const pending = this.pendingLoads.get(path);
        if (pending) {
            pending.push(callback);
            return;
        }

        this.pendingLoads.set(path, [callback]);
        resources.load(path, AudioClip, (err, clip) => {
            const callbacks = this.pendingLoads.get(path) ?? [];
            this.pendingLoads.delete(path);

            if (err || !clip) {
                console.error(`Failed to load audio clip: ${path}`, err);
                return;
            }

            this.clipCache.set(path, clip);
            for (const task of callbacks) {
                task(clip);
            }
        });
    }
}
