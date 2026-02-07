export const POINTS = {
  GOLD: 5,
  SILVER: 3,
  BRONZE: 1,
};

export function calculatePoints(medals) {
  return (
    medals.gold * POINTS.GOLD +
    medals.silver * POINTS.SILVER +
    medals.bronze * POINTS.BRONZE
  );
}

export function calculateTotalMedals(medals) {
  return medals.gold + medals.silver + medals.bronze;
}
