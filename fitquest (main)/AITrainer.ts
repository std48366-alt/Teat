import { analyzePose } from './services/geminiService';
import { Exercise, Feedback, Keypoint } from './types';
import { POSE_CONNECTIONS } from './constants';

// This class assumes specific DOM elements exist in the HTML.
export class AITrainer {
    private exercise: Exercise | null = null;
    private videoStream: MediaStream | null = null;
    private analysisIntervalId: number | null = null;
    private isPaused: boolean = false;

    // DOM Elements
    private videoElement: HTMLVideoElement;
    private canvasElement: HTMLCanvasElement;
    private canvasContext: CanvasRenderingContext2D;
    private feedbackContainer: HTMLElement;
    private placeholderElement: HTMLElement;
    private statusElement: HTMLElement;
    private errorElement: HTMLElement;
    private containerElement: HTMLElement;

    constructor() {
        // Correctly get elements by their IDs from index.html
        this.videoElement = document.getElementById('ai-video-feed') as HTMLVideoElement;
        this.canvasElement = document.getElementById('ai-canvas-overlay') as HTMLCanvasElement;
        this.feedbackContainer = document.getElementById('ai-feedback-display') as HTMLElement;
        this.placeholderElement = document.getElementById('ai-camera-placeholder') as HTMLElement;
        this.statusElement = document.getElementById('ai-camera-status') as HTMLElement;
        this.errorElement = document.getElementById('ai-camera-error') as HTMLElement;
        this.containerElement = document.getElementById('ai-camera-container') as HTMLElement;

        if (!this.videoElement || !this.canvasElement || !this.feedbackContainer || !this.placeholderElement) {
            throw new Error('Required DOM elements for AI Trainer are missing.');
        }
        
        const context = this.canvasElement.getContext('2d');
        if (!context) {
            throw new Error('Could not get 2D context from canvas.');
        }
        this.canvasContext = context;
    }

    public async start(exercise: Exercise) {
        this.exercise = exercise;
        await this.stop(); // Ensure any previous session is fully stopped

        this.statusElement.textContent = 'กำลังเปิดกล้อง...';
        this.errorElement.classList.add('hidden');
        this.placeholderElement.classList.remove('hidden');
        this.isPaused = false;

        try {
            // Use more flexible constraints to improve compatibility
            this.videoStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' }
            });

            this.videoElement.srcObject = this.videoStream;
            
            await this.videoElement.play();
            
            this.placeholderElement.classList.add('hidden'); // Hide placeholder on success
            
            this.videoElement.onloadedmetadata = () => {
                this.canvasElement.width = this.videoElement.videoWidth;
                this.canvasElement.height = this.videoElement.videoHeight;
                // Start analysis loop
                this.scheduleNextAnalysis();
            };

        } catch (error) {
            console.error('Error accessing camera:', error);
            this.statusElement.textContent = 'ไม่สามารถเปิดกล้องได้';
            this.errorElement.textContent = 'กรุณาตรวจสอบว่าคุณได้อนุญาตให้ใช้งานกล้องในเบราว์เซอร์แล้ว';
            this.errorElement.classList.remove('hidden');
            this.stop();
        }
    }

    public async stop() {
        if (this.analysisIntervalId) {
            clearTimeout(this.analysisIntervalId);
            this.analysisIntervalId = null;
        }
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
        this.clearFeedback();
    }

    public pause() {
        if (this.isPaused) return;
        this.isPaused = true;
        this.videoElement?.pause();
        if (this.analysisIntervalId) {
            clearTimeout(this.analysisIntervalId);
            this.analysisIntervalId = null;
        }
    }

    public resume() {
        if (!this.isPaused) return;
        this.isPaused = false;
        this.videoElement?.play();
        this.scheduleNextAnalysis();
    }

    private scheduleNextAnalysis() {
        if (this.analysisIntervalId) clearTimeout(this.analysisIntervalId);
        // Use setTimeout for a recursive loop to ensure delay between analyses
        this.analysisIntervalId = window.setTimeout(this.analyzeFrame, 4000); 
    }

    private analyzeFrame = async () => {
        if (this.isPaused || !this.exercise || !this.videoElement.srcObject) return;

        this.canvasElement.width = this.videoElement.videoWidth;
        this.canvasElement.height = this.videoElement.videoHeight;
        
        // Draw mirrored video frame to canvas
        this.canvasContext.save();
        this.canvasContext.scale(-1, 1);
        this.canvasContext.drawImage(this.videoElement, -this.canvasElement.width, 0, this.canvasElement.width, this.canvasElement.height);
        this.canvasContext.restore();
        
        const imageDataUrl = this.canvasElement.toDataURL('image/jpeg');

        try {
            this.displayFeedback({ feedback: 'กำลังวิเคราะห์ท่าทาง...', isCorrect: false, score: 0 }); // Show analyzing state
            const feedback = await analyzePose(imageDataUrl, this.exercise);
            this.displayFeedback(feedback);
            if (feedback.keypoints) {
                 this.drawPose(feedback.keypoints, feedback.isCorrect);
            }
        } catch (error) {
            console.error('Analysis failed:', error);
            this.displayFeedback({ feedback: 'ไม่สามารถวิเคราะห์ได้ ลองใหม่อีกครั้ง', isCorrect: false, score: 0 });
        } finally {
            // Schedule the next analysis only after the current one is complete
            if (!this.isPaused) {
                this.scheduleNextAnalysis();
            }
        }
    };

    private displayFeedback = (feedback: Feedback) => {
        const borderColor = feedback.isCorrect ? 'border-green-500' : 'border-yellow-500';
        const icon = feedback.isCorrect 
            ? `<svg class="w-8 h-8 text-green-500" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
            : `<svg class="w-8 h-8 text-yellow-500" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>`;

        this.containerElement.classList.remove('border-gray-700', 'border-green-500', 'border-yellow-500');
        this.containerElement.classList.add(borderColor);

        this.feedbackContainer.innerHTML = `
            <div class="bg-gray-800 bg-opacity-80 rounded-2xl p-3 flex items-center space-x-3">
                <div class="flex-shrink-0">${icon}</div>
                <div>
                    <p class="text-white font-semibold text-sm leading-tight">${feedback.feedback}</p>
                    ${feedback.score > 0 ? `<p class="text-gray-400 text-xs mt-1">คะแนน: ${feedback.score}</p>` : ''}
                </div>
            </div>
        `;
    }
    
    private drawPose = (keypoints: Keypoint[], isCorrect: boolean) => {
        const color = isCorrect ? 'aqua' : 'yellow';
        this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);

        const keypointMap = new Map(keypoints.map(k => [k.name, k]));

        POSE_CONNECTIONS.forEach(conn => {
            const from = keypointMap.get(conn[0]);
            const to = keypointMap.get(conn[1]);
            if (from && to) {
                this.canvasContext.beginPath();
                this.canvasContext.moveTo(from.x * this.canvasElement.width, from.y * this.canvasElement.height);
                this.canvasContext.lineTo(to.x * this.canvasElement.width, to.y * this.canvasElement.height);
                this.canvasContext.strokeStyle = color;
                this.canvasContext.lineWidth = 4;
                this.canvasContext.stroke();
            }
        });

        keypoints.forEach(point => {
            this.canvasContext.beginPath();
            this.canvasContext.arc(point.x * this.canvasElement.width, point.y * this.canvasElement.height, 5, 0, 2 * Math.PI);
            this.canvasContext.fillStyle = color;
            this.canvasContext.fill();
        });
    }

    private clearFeedback = () => {
        this.feedbackContainer.innerHTML = '';
        this.containerElement.classList.remove('border-green-500', 'border-yellow-500');
        this.containerElement.classList.add('border-gray-700');
        if (this.canvasContext) {
            this.canvasContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        }
    }
}
