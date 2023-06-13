const SCREEN_WIDTH = 256;
const SCREEN_HEIGHT = 240;

export class Screen {

    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private imageData: ImageData;
    private buf: ArrayBuffer;
    private buf8: Uint8ClampedArray;
    private buf32: Uint32Array;

    public constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = this.canvas.getContext("2d")!;
        this.imageData = this.context.getImageData(
            0,
            0,
            SCREEN_WIDTH,
            SCREEN_HEIGHT
        );
        this.context.fillStyle = "black";
        // set alpha to opaque
        this.context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
        this.buf = new ArrayBuffer(this.imageData.data.length);
        // Get the canvas buffer in 8bit and 32bit
        this.buf8 = new Uint8ClampedArray(this.buf);
        this.buf32 = new Uint32Array(this.buf);
        // Set alpha
        for (let i = 0; i < this.buf32.length; ++i) {
            this.buf32[i] = 0xff000000;
        }
    }

    public setBuffer = (buffer: any) => {
        let i = 0;
        for (let y = 0; y < SCREEN_HEIGHT; ++y) {
            for (let x = 0; x < SCREEN_WIDTH; ++x) {
                i = y * 256 + x;
                // Convert pixel from NES BGR to canvas ABGR
                this.buf32[i] = 0xff000000 | buffer[i]; // Full alpha
            }
        }
    };

    public writeBuffer = () => {
        this.imageData.data.set(this.buf8);
        this.context.putImageData(this.imageData, 0, 0);
    };

    // public fitInParent = () => {
    //     let parent = this.canvas.parentNode;
    //     // @ts-ignore
    //     let parentWidth = parent.clientWidth;
    //     // @ts-ignore
    //     let parentHeight = parent.clientHeight;
    //     let parentRatio = parentWidth / parentHeight;
    //     let desiredRatio = SCREEN_WIDTH / SCREEN_HEIGHT;
    //     if (desiredRatio < parentRatio) {
    //         this.canvas.style.width = `${Math.round(parentHeight * desiredRatio)}px`;
    //         this.canvas.style.height = `${parentHeight}px`;
    //     } else {
    //         this.canvas.style.width = `${parentWidth}px`;
    //         this.canvas.style.height = `${Math.round(parentWidth / desiredRatio)}px`;
    //     }
    // };

    // screenshot() {
    //     var img = new Image();
    //     img.src = this.canvas.toDataURL("image/png");
    //     return img;
    // }

    // handleMouseDown = e => {
    //     if (!this.props.onMouseDown) return;
    //     // Make coordinates unscaled
    //     let scale = SCREEN_WIDTH / parseFloat(this.canvas.style.width);
    //     let rect = this.canvas.getBoundingClientRect();
    //     let x = Math.round((e.clientX - rect.left) * scale);
    //     let y = Math.round((e.clientY - rect.top) * scale);
    //     this.props.onMouseDown(x, y);
    // };
}
