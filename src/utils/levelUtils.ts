
export const calculateLevel = (totalWagered: number): number => {
  const wagerLevels = [
    { level: 25, wager: 100_000_000_000 }, // 100 billion (level 25)
    { level: 24, wager: 70_000_000_000 },
    { level: 23, wager: 40_000_000_000 },
    { level: 22, wager: 20_000_000_000 },
    { level: 21, wager: 15_000_000_000 },
    { level: 20, wager: 10_000_000_000 },
    { level: 19, wager: 9_000_000_000 },
    { level: 18, wager: 7_000_000_000 },
    { level: 17, wager: 5_000_000_000 },
    { level: 16, wager: 2_000_000_000 },
    { level: 15, wager: 1_000_000_000 },
    { level: 14, wager: 800_000_000 },
    { level: 13, wager: 600_000_000 },
    { level: 12, wager: 500_000_000 },
    { level: 11, wager: 400_000_000 },
    { level: 10, wager: 300_000_000 },
    { level: 9, wager: 250_000_000 },
    { level: 8, wager: 200_000_000 },
    { level: 7, wager: 180_000_000 },
    { level: 6, wager: 150_000_000 },
    { level: 5, wager: 100_000_000 },
    { level: 4, wager: 70_000_000 },
    { level: 3, wager: 50_000_000 },
    { level: 2, wager: 30_000_000 },
    { level: 1, wager: 10_000_000 },
    { level: 0, wager: 0 }
  ];

  return wagerLevels.find(({ wager }) => totalWagered >= wager)?.level || 0;
};

export const getLevelReward = (level: number): number => {
  if (level >= 25) return 35_000_000;
  if (level >= 20) return 30_000_000;
  if (level >= 15) return 25_000_000;
  if (level >= 10) return 20_000_000;
  if (level >= 5) return 2_000_000;
  if (level >= 1) return 1_000_000;
  return 100_000;
};
