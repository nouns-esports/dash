export function getLevel(input: {
    xp: number, config?: {
        base: number; // Starting XP required to reach level 2
        max: number; // Max XP required to level up
        midpoint: number; // Level at which growth starts to slow
        steepness: number; // Controls how quickly the curve flattens
    } | null
}) {
    const base = input.config?.base ?? 150;
    const max = input.config?.max ?? 2001;
    const midpoint = input.config?.midpoint ?? 80;
    const steepness = input.config?.steepness ?? 0.04;

    let currentLevel = 1;
    let accumulatedXP = 0;

    function calculateRequiredXP(level: number): number {
        if (level === 1) return base;
        const logistic = 1 / (1 + Math.exp(-steepness * (level - midpoint)));
        return Math.floor(base + (max - base) * logistic);
    }

    let requiredXP = calculateRequiredXP(currentLevel);

    while (accumulatedXP + requiredXP <= input.xp) {
        accumulatedXP += requiredXP;
        currentLevel++;
        requiredXP = calculateRequiredXP(currentLevel);
    }

    return {
        currentLevel,
        requiredXP,
        progressXP: input.xp - accumulatedXP,
    };
}