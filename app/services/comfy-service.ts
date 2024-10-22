import { Http } from '@nativescript/core';

const COMFY_URL = 'http://localhost:8188';
const USE_MOCK = false;

// Mock image URLs for testing
const MOCK_IMAGES = [
    'https://picsum.photos/800/600',
    'https://picsum.photos/800/601',
    'https://picsum.photos/800/602',
    'https://picsum.photos/800/603'
];

export async function generateImages(imagePrompt: string): Promise<string | null> {
    if (USE_MOCK) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return a random mock image URL
        return MOCK_IMAGES[Math.floor(Math.random() * MOCK_IMAGES.length)];
    }

    try {
        // Queue the prompt
        const promptResponse = await Http.request({
            url: `${COMFY_URL}/prompt`,
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            content: JSON.stringify({
                prompt: {
                    "3": {
                        "inputs": {
                            "seed": Math.floor(Math.random() * 1000000),
                            "steps": 20,
                            "cfg": 8,
                            "sampler_name": "euler",
                            "scheduler": "normal",
                            "denoise": 1,
                            "model": "sdxl_base",
                            "positive": imagePrompt,
                            "negative": "blurry, bad quality, distorted"
                        }
                    }
                }
            })
        });

        const promptId = JSON.parse(promptResponse.content).prompt_id;
        
        // Wait for completion and get image
        return await waitForImageGeneration(promptId);
    } catch (error) {
        console.error('Error generating image:', error);
        return null;
    }
}

async function waitForImageGeneration(promptId: string): Promise<string | null> {
    try {
        // Poll history endpoint until image is ready
        let attempts = 0;
        while (attempts < 30) {
            const historyResponse = await Http.request({
                url: `${COMFY_URL}/history/${promptId}`,
                method: 'GET'
            });

            const history = JSON.parse(historyResponse.content)[promptId];
            if (history && history.outputs) {
                for (const nodeId in history.outputs) {
                    const output = history.outputs[nodeId];
                    if (output.images && output.images.length > 0) {
                        return output.images[0].filename;
                    }
                }
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            attempts++;
        }

        throw new Error('Image generation timed out');
    } catch (error) {
        console.error('Error waiting for image generation:', error);
        return null;
    }
}