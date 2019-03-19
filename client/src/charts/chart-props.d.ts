declare interface ChartProps {
    id: string;
    data: import('chart.js').ChartData,
    options?: import('chart.js').ChartOptions
}