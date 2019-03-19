import React, { ReactElement, Ref, useEffect, useRef } from 'react';
import { Chart } from 'chart.js';

import './_charts.scss';

export function PolarAreaChart(props: ChartProps): ReactElement {
    const canvasRef: Ref<HTMLCanvasElement> = useRef(null);

    let chart: Chart;

    useEffect(() => {
        chart = new Chart(canvasRef.current, {
            type: 'polarArea',
            data: props.data,
            options: props.options || { layout: { padding: 2 } }
        });

        return () => {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            context.clearRect(0, 0, canvas.width, canvas.height);
            chart.destroy();
        };
    }, [ props.data ]);

    return (
        <div className='chart-container'>
            <canvas id={props.id} ref={canvasRef}></canvas>
        </div>);
}
