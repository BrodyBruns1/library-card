import { Http } from '@nativescript/core';

const OLLAMA_URL = 'http://localhost:11434/api';
const USE_MOCK = false; // Toggle for testing

export async function fetchStoryChoices(prompt: string): Promise<string[]> {
    if (USE_MOCK) {
        return [
            "The brave knight draws his sword and challenges the dragon to combat",
            "The knight offers the dragon a peace treaty and shares his provisions"
        ];
    }

    try {
        const response = await Http.request({
            url: `${OLLAMA_URL}/generate`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            content: JSON.stringify({
                model: 'llama2',
                prompt: `Given this story prompt: "${prompt}", generate two different possible story continuations. Format as JSON array with exactly two choices.`,
                stream: false
            })
        });

        const choices = JSON.parse(response.content).choices;
        return choices.slice(0, 2);
    } catch (error) {
        console