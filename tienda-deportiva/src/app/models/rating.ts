export interface Rating {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  score: number;
  comment: string;
  date: string;
}

export interface RatingSummary {
  ratings: Rating[];
  average: number;
  count: number;
}

export interface RatingResponse {
  ratings: Rating[];
  average: number;
  count: number;
}
