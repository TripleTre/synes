import { useCallback, useEffect, useRef } from 'react';
import './App.css'
import { NESClient } from "./NESClient.ts";
import { loadBinary } from "./utils.ts";

function App() {

    const canvas = useRef<HTMLCanvasElement>(null);
    const nes = useRef<NESClient>(new NESClient());

    const start = useCallback(() => {
        if (canvas.current && nes.current) {
            nes.current.init(canvas.current);
            const gameUrl = "http://10.6.0.92:5173/game.nes";
            loadBinary(gameUrl, (err: any, data: any) => {
                console.log(err);
                console.log(data.length);
                nes.current.boot(data as any);
            }, (p: any) => {
                console.log(p);
            });
            // fetch(gameUrl, {
            //     headers: {
            //         "Content-Type": "text/plain; charset=x-user-defined"
            //     }
            // }).then(res => {
            //     return res.text();
            // }).then(data => {
            //     console.log("==========")
            //     console.log(data.length);
            //     // nes.current.boot(data as any);
            // });
        }
    }, [canvas]);

    return (
        <>
            <button onClick={start}>start</button>
            <canvas ref={canvas} width={256} height={240} />
        </>
    )
}

export default App
