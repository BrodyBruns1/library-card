import { Observable } from '@nativescript/core';
import { fetchStoryChoices, fetchImagePrompts } from './services/ollama-service';
import { generateImages } from './services/comfy-service';
import { StoryPath } from './models/story-path';

export class MainViewModel extends Observable {
    private _loading = false;
    private _error: string | null = null;
    private _userPrompt = '';
    private _storyStarted = false;
    private _currentPaths: StoryPath[] = [];
    private _currentStoryText = '';

    constructor() {
        super();
    }

    get loading(): boolean {
        return this._loading;
    }

    set loading(value: boolean) {
        if (this._loading !== value) {
            this._loading = value;
            this.notifyPropertyChange('loading', value);
        }
    }

    get error(): string | null {
        return this._error;
    }

    set error(value: string | null) {
        if (this._error !== value) {
            this._error = value;
            this.notifyPropertyChange('error', value);
        }
    }

    get userPrompt(): string {
        return this._userPrompt;
    }

    set userPrompt(value: string) {
        if (this._userPrompt !== value) {
            this._userPrompt = value;
            this.notifyPropertyChange('userPrompt', value);
        }
    }

    get storyStarted(): boolean {
        return this._storyStarted;
    }

    set storyStarted(value: boolean) {
        if (this._storyStarted !== value) {
            this._storyStarted = value;
            this.notifyPropertyChange('storyStarted', value);
        }
    }

    get currentPaths(): StoryPath[] {
        return this._currentPaths;
    }

    set currentPaths(value: StoryPath[]) {
        this._currentPaths = value;
        this.notifyPropertyChange('currentPaths', value);
    }

    get currentStoryText(): string {
        return this._currentStoryText;
    }

    set currentStoryText(value: string) {
        if (this._currentStoryText !== value) {
            this._currentStoryText = value;
            this.notifyPropertyChange('currentStoryText', value);
        }
    }

    async startStory() {
        if (!this.userPrompt.trim()) {
            this.error = 'Please enter a story prompt';
            return;
        }

        try {
            this.loading = true;
            this.error = null;
            this.currentStoryText = this.userPrompt;

            const choices = await fetchStoryChoices(this.userPrompt);
            const paths = await Promise.all(
                choices.map(async (choice) => {
                    const imagePrompt = await fetchImagePrompts(choice);
                    const imageUrl = await generateImages(imagePrompt);
                    return new StoryPath(choice, imagePrompt, imageUrl);
                })
            );

            this.currentPaths = paths;
            this.storyStarted = true;

        } catch (error) {
            this.error = error.message;
            console.error('Error starting story:', error);
        } finally {
            this.loading = false;
        }
    }

    async selectPath(args: any) {
        try {
            const index = args.index;
            const selectedPath = this.currentPaths[index];

            if (!selectedPath) {
                throw new Error('Invalid path selected');
            }

            this.loading = true;
            this.error = null;
            this.currentStoryText = selectedPath.choice;

            const choices = await fetchStoryChoices(selectedPath.choice);
            const paths = await Promise.all(
                choices.map(async (choice) => {
                    const imagePrompt = await fetchImagePrompts(choice);
                    const imageUrl = await generateImages(imagePrompt);
                    return new StoryPath(choice, imagePrompt, imageUrl);
                })
            );

            this.currentPaths = paths;

        } catch (error) {
            this.error = error.message;
            console.error('Error selecting path:', error);
        } finally {
            this.loading = false;
        }
    }
}