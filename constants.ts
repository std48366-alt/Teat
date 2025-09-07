import { Exercise } from './types';

// FIX: Set the Gemini model name according to the guidelines.
export const GEMINI_MODEL_NAME = 'gemini-2.5-flash';

// FIX: Add POSE_CONNECTIONS to define skeleton lines for the canvas overlay. This resolves an import error in AITrainer.ts.
export const POSE_CONNECTIONS: [string, string][] = [
    // Torso
    ['left_shoulder', 'right_shoulder'],
    ['left_shoulder', 'left_hip'],
    ['right_shoulder', 'right_hip'],
    ['left_hip', 'right_hip'],
    // Left Arm
    ['left_shoulder', 'left_elbow'],
    ['left_elbow', 'left_wrist'],
    // Right Arm
    ['right_shoulder', 'right_elbow'],
    ['right_elbow', 'right_wrist'],
    // Left Leg
    ['left_hip', 'left_knee'],
    ['left_knee', 'left_ankle'],
    // Right Leg
    ['right_hip', 'right_knee'],
    ['right_knee', 'right_ankle'],
];

// FIX: Provided the exercise data required by the application.
export const EXERCISES: Exercise[] = [
  {
    id: 'jumping-jacks',
    name: 'Jumping Jacks',
    description: 'A full-body exercise that raises your heart rate.',
    instructions: [
        'Stand upright with your legs together, arms at your sides.',
        'Bend your knees slightly, and jump into the air.',
        'As you jump, spread your legs to be about shoulder-width apart. Stretch your arms out and over your head.',
        'Jump back to starting position.'
    ],
    image: './images/jumping-jacks.png',
  },
  {
    id: 'high-knees',
    name: 'High Knees',
    description: 'A cardio-intensive exercise performed in place.',
    instructions: [
        'Stand with your feet hip-width apart.',
        'Lift up your left knee to your chest.',
        'Switch to lift your right knee to your chest. Continue the movement, alternating legs and moving at a sprinting or running pace.',
        'Keep your back straight and core engaged.'
    ],
    image: './images/high-knees.png',
  },
  {
    id: 'burpees',
    name: 'Burpees',
    description: 'A full body exercise used in strength training and as an aerobic exercise.',
    instructions: [
        'Start in a squat position with your knees bent, back straight, and your feet about shoulder-width apart.',
        'Lower your hands to the floor in front of you so they’re just inside your feet.',
        'With your weight on your hands, kick your feet back so you’re on your hands and toes, and in a push-up position.',
        'Jump your feet back towards your hands.',
        'Reach your arms over your head and explosively jump up into the air.'
    ],
    image: './images/burpees.png',
  },
  {
    id: 'mountain-climbers',
    name: 'Mountain Climbers',
    description: 'A bodyweight exercise that works multiple muscle groups.',
    instructions: [
        'Start in a push-up position.',
        'Bring your right knee towards your chest.',
        'Return to the starting position and repeat with your left leg.',
        'Continue alternating legs.'
    ],
    image: './images/mountain-climbers.png',
  },
  {
    id: 'squats',
    name: 'Squats',
    description: 'A strength exercise in which the trainee lowers their hips from a standing position and then stands back up.',
    instructions: [
        'Stand with your feet a little wider than your hips.',
        'Keep your chest up and proud and your back straight.',
        'Sit back into your hips, bending your knees and ankles.',
        'Lower until your hips are slightly below your knees.',
        'Return to the start position by pushing through your heels.'
    ],
    image: './images/squats.png',
  },
  {
    id: 'push-ups',
    name: 'Push-ups',
    description: 'A common calisthenics exercise beginning from the prone position.',
    instructions: [
        'Get on all fours, placing your hands slightly wider than your shoulders.',
        'Straighten your arms and legs.',
        'Lower your body until your chest nearly touches the floor.',
        'Push yourself back up.'
    ],
    image: './images/push-ups.png',
  },
  {
    id: 'plank',
    name: 'Plank',
    description: 'An isometric core strength exercise that involves maintaining a position similar to a push-up for the maximum possible time.',
    instructions: [
        'Place forearms on the floor with elbows aligned below shoulders and arms parallel to your body at about shoulder width.',
        'If flat palms bother your wrists, clasp your hands together.',
        'Your body should form a straight line from your head to your feet.',
        'Engage your core by sucking your belly button into your spine.'
    ],
    image: './images/plank.png',
  },
  {
    id: 'lunges',
    name: 'Lunges',
    description: 'A strength training exercise that can be used to develop lower-body strength and endurance.',
    instructions: [
        'Step forward with one leg, lowering your hips until both knees are bent at an approximate 90-degree angle.',
        'Your front knee should be directly above your second toe.',
        'Your back knee should not touch the ground.',
        'Push off your front foot to return to the starting position.'
    ],
    image: './images/lunges.png',
  },
];