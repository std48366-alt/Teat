import { AITrainer } from './AITrainer';
import { EXERCISES } from './constants';
import { Exercise } from './types';

// Extend the Window interface for TypeScript
declare global {
    interface Window {
        showHome: () => void;
        showWorkouts: () => void;
        showProgress: () => void;
        showProfile: () => void;
        startRandomWorkout: () => void;
        openAICoach: () => void;
        showAICamera: () => void;
        openWorkoutCategory: (category: 'cardio' | 'strength') => void;
        closeWorkoutModal: () => void;
        selectExercise: (exerciseId: string) => void;
        startWorkout: () => void;
        pauseWorkout: () => void;
        resumeWorkout: () => void;
        stopWorkout: () => void;
        nextExercise: () => void;
    }
}

class AppController {
    private aiTrainer: AITrainer | null = null;
    private currentWorkout: Exercise | null = null;
    private workoutTimer: number | null = null;
    private currentTime: number = 30;
    private isPaused: boolean = false;
    private streak: number = 0;
    private lastWorkoutDate: string = '';

    // DOM Elements
    private mainContent: HTMLElement;
    private pageContainer: HTMLElement;
    private workoutModal: HTMLElement;
    private workoutTitle: HTMLElement;
    private workoutContent: HTMLElement;
    private startWorkoutBtn: HTMLElement;
    private activeWorkoutModal: HTMLElement;
    private activeWorkoutTitle: HTMLElement;
    private workoutTimerDisplay: HTMLElement;
    private pauseResumeBtn: HTMLElement;
    private streakCountEl: HTMLElement;
    private streakCardEl: HTMLElement;
    private streakIconEl: HTMLElement;
    private streakModal: HTMLElement;
    private streakModalText: HTMLElement;

    constructor() {
        this.mainContent = document.querySelector('main')!;
        this.pageContainer = this.getElement('page-container');
        this.workoutModal = this.getElement('workoutModal');
        this.workoutTitle = this.getElement('workoutTitle');
        this.workoutContent = this.getElement('workoutContent');
        this.startWorkoutBtn = this.getElement('startWorkoutBtn');
        this.activeWorkoutModal = this.getElement('activeWorkoutModal');
        this.activeWorkoutTitle = this.getElement('activeWorkoutTitle');
        this.workoutTimerDisplay = this.getElement('workoutTimer');
        this.pauseResumeBtn = this.getElement('pause-resume-btn');
        this.streakCountEl = this.getElement('streak-count');
        this.streakCardEl = this.getElement('streak-card');
        this.streakIconEl = this.getElement('streak-icon');
        this.streakModal = this.getElement('streak-modal');
        this.streakModalText = this.getElement('streak-modal-text');

        this.attachToWindow();
        this.loadStreak();
        this.updateStreakDisplay();
    }

    private getElement<T extends HTMLElement>(id: string): T {
        const el = document.getElementById(id);
        if (!el) throw new Error(`Element with id "${id}" not found.`);
        return el as T;
    }

    private attachToWindow() {
        window.showHome = this.showHome;
        window.showWorkouts = this.showWorkouts;
        window.showProgress = this.showProgress;
        window.showProfile = this.showProfile;
        window.startRandomWorkout = this.startRandomWorkout;
        window.openAICoach = this.openAICoach;
        window.showAICamera = this.showAICamera;
        window.openWorkoutCategory = this.openWorkoutCategory;
        window.closeWorkoutModal = this.closeWorkoutModal;
        window.selectExercise = this.selectExercise;
        window.startWorkout = this.startWorkout;
        window.pauseWorkout = this.pauseWorkout;
        window.resumeWorkout = this.resumeWorkout;
        window.stopWorkout = this.stopWorkout;
        window.nextExercise = this.nextExercise;
    }
    
    // --- Streak System ---
    private loadStreak = () => {
        this.streak = parseInt(localStorage.getItem('fitquest_streak') || '0');
        this.lastWorkoutDate = localStorage.getItem('fitquest_lastWorkoutDate') || '';
        this.checkStreak();
    }

    private saveStreak = () => {
        localStorage.setItem('fitquest_streak', this.streak.toString());
        localStorage.setItem('fitquest_lastWorkoutDate', this.lastWorkoutDate);
    }
    
    private getTodayDateString = () => {
        return new Date().toISOString().split('T')[0];
    }

    private checkStreak = () => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        
        const todayStr = this.getTodayDateString();
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (this.lastWorkoutDate && this.lastWorkoutDate !== todayStr && this.lastWorkoutDate !== yesterdayStr) {
            this.streak = 0; // Reset streak if user missed a day
        }
        this.saveStreak();
        this.updateStreakDisplay();
    }

    private incrementStreak = () => {
        const todayStr = this.getTodayDateString();
        if (this.lastWorkoutDate !== todayStr) {
            this.checkStreak(); // Check if streak was broken before incrementing
            this.streak++;
            this.lastWorkoutDate = todayStr;
            this.saveStreak();
            this.showStreakCelebration();
        }
        this.updateStreakDisplay();
    }

    private updateStreakDisplay = () => {
        this.streakCountEl.textContent = this.streak.toString();
        if (this.streak > 0) {
            this.streakCardEl.classList.add('glow-button');
            this.streakIconEl.classList.add('animate-bounce');
        } else {
            this.streakCardEl.classList.remove('glow-button');
            this.streakIconEl.classList.remove('animate-bounce');
        }
    }
    
    private showStreakCelebration = () => {
        this.streakModalText.textContent = `You are on a ${this.streak} day streak!`;
        this.streakModal.classList.remove('hidden');
    }

    // --- Page Navigation ---
    // FIX: Converted to arrow function to preserve 'this' context
    public showHome = () => {
        this.pageContainer.innerHTML = '';
        this.mainContent.classList.remove('hidden');
    }

    // FIX: Converted to arrow function to preserve 'this' context
    public showWorkouts = () => {
        this.mainContent.classList.add('hidden');
        this.pageContainer.innerHTML = `<div class="p-4 text-white"><h2>Workouts Page</h2><p>Coming soon...</p><button onclick="showHome()" class="text-green-400 mt-4">Back to Home</button></div>`;
    }
    
    // FIX: Converted to arrow function to preserve 'this' context
    public showProgress = () => {
        this.mainContent.classList.add('hidden');
        this.pageContainer.innerHTML = `<div class="p-4 text-white"><h2>Progress Page</h2><p>Coming soon...</p><button onclick="showHome()" class="text-green-400 mt-4">Back to Home</button></div>`;
    }

    // FIX: Converted to arrow function to preserve 'this' context
    public showProfile = () => {
        this.mainContent.classList.add('hidden');
        this.pageContainer.innerHTML = `<div class="p-4 text-white"><h2>Profile Page</h2><p>Coming soon...</p><button onclick="showHome()" class="text-green-400 mt-4">Back to Home</button></div>`;
    }

    // --- Workout Flow ---
    // FIX: Converted to arrow function to preserve 'this' context
    public openWorkoutCategory = (category: 'cardio' | 'strength') => {
        const categoryExercises = EXERCISES.filter(ex => {
            const cardioIds = ['jumping-jacks', 'high-knees', 'burpees', 'mountain-climbers'];
            const strengthIds = ['squats', 'push-ups', 'plank', 'lunges'];
            if (category === 'cardio') return cardioIds.includes(ex.id);
            if (category === 'strength') return strengthIds.includes(ex.id);
            return false;
        });

        this.workoutTitle.textContent = category === 'cardio' ? 'คาร์ดิโอ' : 'เสริมกล้ามเนื้อ';
        this.workoutContent.innerHTML = `
            <div class="space-y-2 max-h-60 overflow-y-auto">
                ${categoryExercises.map(ex => `
                    <div class="bg-gray-800 p-3 rounded-xl border border-gray-700 flex items-center justify-between">
                        <span class="text-white font-medium">${ex.name}</span>
                        <button data-exercise-id="${ex.id}" onclick="window.selectExercise('${ex.id}')" class="bg-gray-600 px-3 py-1 rounded-full text-sm font-bold nav-item">
                            เลือก
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        this.workoutModal.classList.remove('hidden');
        this.startWorkoutBtn.classList.add('hidden');
    }

    // FIX: Converted to arrow function to preserve 'this' context
    public selectExercise = (exerciseId: string) => {
        const exercise = EXERCISES.find(ex => ex.id === exerciseId);
        if (!exercise) return;
        this.currentWorkout = exercise;

        this.workoutContent.querySelectorAll('button').forEach(btn => {
            btn.classList.replace('bg-green-500', 'bg-gray-600');
        });
        const selectedButton = this.workoutContent.querySelector(`button[data-exercise-id="${exerciseId}"]`);
        selectedButton?.classList.replace('bg-gray-600', 'bg-green-500');

        this.startWorkoutBtn.classList.remove('hidden');
    }

    // FIX: Converted to arrow function to preserve 'this' context
    public closeWorkoutModal = () => {
        this.workoutModal.classList.add('hidden');
        this.currentWorkout = null;
    }

    // FIX: Converted to arrow function to preserve 'this' context
    public startWorkout = () => {
        if (!this.currentWorkout) {
            alert('Please select an exercise.');
            return;
        }

        const workoutToStart = this.currentWorkout;
        
        this.closeWorkoutModal();
        this.activeWorkoutModal.classList.remove('hidden');
        this.activeWorkoutTitle.textContent = workoutToStart.name;
        
        if (!this.aiTrainer) {
            this.aiTrainer = new AITrainer();
        }
        this.aiTrainer.start(workoutToStart);
        
        this.startTimer();
    }

    // FIX: Converted to arrow function to preserve 'this' context
    public stopWorkout = () => {
        this.aiTrainer?.stop();
        if (this.workoutTimer) {
            clearInterval(this.workoutTimer);
            this.workoutTimer = null;
        }
        this.activeWorkoutModal.classList.add('hidden');
        this.incrementStreak();
        this.showHome();
    }

    // FIX: Converted to arrow function to preserve 'this' context
    public pauseWorkout = () => {
        if (this.isPaused) return;
        this.isPaused = true;
        this.aiTrainer?.pause();
        if (this.workoutTimer) clearInterval(this.workoutTimer);
        this.pauseResumeBtn.innerHTML = '▶️ เริ่มต่อ';
        this.pauseResumeBtn.setAttribute('onclick', 'window.resumeWorkout()');
    }

    // FIX: Converted to arrow function to preserve 'this' context
    public resumeWorkout = () => {
        if (!this.isPaused) return;
        this.isPaused = false;
        this.aiTrainer?.resume();
        this.startTimer();
        this.pauseResumeBtn.innerHTML = '⏸️ หยุดชั่วคราว';
        this.pauseResumeBtn.setAttribute('onclick', 'window.pauseWorkout()');
    }

    // FIX: Converted to arrow function to preserve 'this' context
    public nextExercise = () => {
        const currentIndex = EXERCISES.findIndex(ex => ex.id === this.currentWorkout?.id);
        const nextIndex = (currentIndex + 1) % EXERCISES.length;
        this.currentWorkout = EXERCISES[nextIndex];

        if (this.workoutTimer) clearInterval(this.workoutTimer);
        
        this.activeWorkoutTitle.textContent = this.currentWorkout.name;
        this.aiTrainer?.start(this.currentWorkout); // Restart trainer with new exercise
        this.startTimer();
    }
    
    // FIX: Converted to arrow function to preserve 'this' context
    public startRandomWorkout = () => {
        const randomExercise = EXERCISES[Math.floor(Math.random() * EXERCISES.length)];
        this.currentWorkout = randomExercise;
        this.startWorkout();
    }

    // FIX: Converted to arrow function to preserve 'this' context
    public openAICoach = () => alert('AI Coach feature coming soon!');
    // FIX: Converted to arrow function to preserve 'this' context
    public showAICamera = () => alert('Please start a workout to use the AI Camera.');

    private startTimer = () => {
        this.currentTime = 30;
        this.updateTimerDisplay();
        this.workoutTimer = window.setInterval(() => {
            this.currentTime--;
            this.updateTimerDisplay();
            if (this.currentTime <= 0) {
                if (this.workoutTimer) clearInterval(this.workoutTimer);
                this.nextExercise();
            }
        }, 1000);
    }
    
    private updateTimerDisplay = () => {
        const minutes = Math.floor(this.currentTime / 60).toString().padStart(2, '0');
        const seconds = (this.currentTime % 60).toString().padStart(2, '0');
        this.workoutTimerDisplay.textContent = `${minutes}:${seconds}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AppController();
});
