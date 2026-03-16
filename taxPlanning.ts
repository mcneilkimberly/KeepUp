// From ChatGPT
function getEstimatedTax(profit: number): number {
    const brackets = [
        [11925, 0.10],
        [48475, 0.12],
        [103350, 0.22],
        [197300, 0.24],
        [250525, 0.32],
        [626350, 0.35],
        [Infinity, 0.37]
    ];

    let tax = 0;
    let prev = 0;

    for (const [limit, rate] of brackets) {
        const taxable = Math.min(profit, limit) - prev;
        if (taxable <= 0) break;

        tax += taxable * rate;
        prev = limit;
    }

    return Math.round(tax);
}