import { Observable } from '@nativescript/core';

export interface StoryPathData {
  choice: string;
  imagePrompt: string;
  imageUrl: string | null;
  nextPaths?: StoryPathData[];
}

export class StoryPath extends Observable {
  private _data: StoryPathData;

  constructor(data: StoryPathData) {
    super();
    this._data = data;
  }

  get choice(): string {
    return this._data.choice;
  }

  get imagePrompt(): string {
    return this._data.imagePrompt;
  }

  get imageUrl(): string | null {
    return this._data.imageUrl;
  }

  get nextPaths(): StoryPathData[] | undefined {
    return this._data.nextPaths;
  }

  set nextPaths(value: StoryPathData[] | undefined) {
    this._data.nextPaths = value;
    this.notifyPropertyChange('nextPaths', value);
  }
}