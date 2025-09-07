export interface Keypoint {
  name: string;
  x: number;
  y: number;
  score?: number;
}

export interface Feedback {
  isCorrect: boolean;
  feedback: string;
  score: number;
  keypoints?: Keypoint[];
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  instructions: string[];
  image: string;
}
