export type MigrationPair = [string, number];
export type MigrationPairWithColor = [string, number, string?];

export interface MigrationDisplacementProps {
  onBack?: () => void;
}

export interface MigrationScene {
  num: string;
  title: string;
  stat: string;
  statLbl: string;
  body: string;
  bullets: string[];
  ask: string;
  cap: string;
  ctitle: string;
}
