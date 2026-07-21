export function hexPath(r: number): string {
    const points = Array.from({length: 6}, (_,i) => {
        const angle = (Math.PI / 180) * (60 * i - 30);
        return `${(r * Math.cos(angle)).toFixed(2)},${(r * Math.sin(angle)).toFixed(2)}`;
    });
    return `M${points.join("L")}Z`;
}