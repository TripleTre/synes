import RingBuffer from "ringbufferjs";

type OnBufferUnderrun = (actualSize: number, desiredSize: number) => void;
export class Speakers {
    private onBufferUnderrun: OnBufferUnderrun;
    private bufferSize: number;
    public buffer: RingBuffer<number>;
    private audioCtx?: AudioContext;
    private scriptNode?: ScriptProcessorNode;

    public constructor(onBufferUnderrun: OnBufferUnderrun) {
        this.onBufferUnderrun = onBufferUnderrun;
        this.bufferSize = 8192;
        this.buffer = new RingBuffer(this.bufferSize * 2);
    }

    public getSampleRate() {
        if (!window.AudioContext) {
            return 44100;
        }
        const myCtx = new window.AudioContext();
        const sampleRate = myCtx.sampleRate;
        myCtx.close();
        return sampleRate;
    }

    public start() {
        // Audio is not supported
        if (!window.AudioContext) {
            return;
        }
        this.audioCtx = new window.AudioContext();
        this.scriptNode = this.audioCtx.createScriptProcessor(1024, 0, 2);
        this.scriptNode.onaudioprocess = this.onaudioprocess;
        this.scriptNode.connect(this.audioCtx.destination);
    }

    public stop() {
        if (this.scriptNode) {
            if (this.audioCtx) {
                this.scriptNode.disconnect(this.audioCtx.destination);
            }
            this.scriptNode.onaudioprocess = null;
            this.scriptNode = undefined;
        }
        if (this.audioCtx) {
            this.audioCtx.close().catch(err => {
                console.log(err);
            });
            this.audioCtx = undefined;
        }
    }

    public writeSample = (left: any, right: any) => {
        if (this.buffer.size() / 2 >= this.bufferSize) {
            console.log(`Buffer overrun`);
            this.buffer.deqN(this.bufferSize / 2);
        }
        this.buffer.enq(left);
        this.buffer.enq(right);
    };

    public onaudioprocess = (e: any) => {
        const left = e.outputBuffer.getChannelData(0);
        const right = e.outputBuffer.getChannelData(1);
        const size = left.length;

        // We're going to buffer underrun. Attempt to fill the buffer.
        if (this.buffer.size() < size * 2 && this.onBufferUnderrun) {
            this.onBufferUnderrun(this.buffer.size(), size * 2);
        }

        try {
            const samples = this.buffer.deqN(size * 2);
            for (let i = 0; i < size; i++) {
                left[ i ] = samples[ i * 2 ];
                right[ i ] = samples[ i * 2 + 1 ];
            }
        } catch (e) {
            // onBufferUnderrun failed to fill the buffer, so handle a real buffer
            // underrun

            // ignore empty buffers... assume audio has just stopped
            const bufferSize = this.buffer.size() / 2;
            if (bufferSize > 0) {
                console.log(`Buffer underrun (needed ${size}, got ${bufferSize})`);
            }
            for (let j = 0; j < size; j++) {
                left[ j ] = 0;
                right[ j ] = 0;
            }
            return;
        }
    };
}
