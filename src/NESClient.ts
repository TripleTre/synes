// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { NES } from "jsnes";
import { Speakers } from "./Speaker.ts";
import FrameTimer from "./FrameTimer.ts";
import { Screen } from "./Screen.ts";

export class NESClient {

    private nes: any;

    private speaker!: Speakers;
    private frameTimer!: FrameTimer;
    private screen!: Screen;

    public init(canvas: HTMLCanvasElement) {
        this.screen = new Screen(canvas);
        this.speaker = new Speakers((actualSize: number, desiredSize: number) => {
            // Skip a video frame so audio remains consistent. This happens for
            // a variety of reasons:
            // - Frame rate is not quite 60fps, so sometimes buffer empties
            // - Page is not visible, so requestAnimationFrame doesn't get fired.
            //   In this case emulator still runs at full speed, but timing is
            //   done by audio instead of requestAnimationFrame.
            // - System can't run emulator at full speed. In this case it'll stop
            //    firing requestAnimationFrame.
            console.log(actualSize,
                "Buffer underrun, running another frame to try and catch up"
            );

            this.frameTimer.generateFrame();
            // desiredSize will be 2048, and the NES produces 1468 samples on each
            // frame so we might need a second frame to be run. Give up after that
            // though -- the system is not catching up
            if (this.speaker.buffer.size() < desiredSize) {
                console.log("Still buffer underrun, running a second frame");
                this.frameTimer.generateFrame();
            }
        });
        this.nes = new NES({
            onFrame: this.screen.setBuffer,
            onStatusUpdate: console.log,
            onAudioSample: this.speaker.writeSample,
            sampleRate: this.speaker.getSampleRate()
        });
        this.frameTimer = new FrameTimer({
            onGenerateFrame: this.nes.frame,
            onWriteFrame: this.screen.writeBuffer,
        });
    }

    private start() {
        this.frameTimer.start();
        this.speaker.start();
    }

    private stop() {
        this.frameTimer.stop();
        this.speaker.stop();
    }

    public boot(rom: string) {
        this.nes.loadROM(rom);
        this.start();
    }
}
