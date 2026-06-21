import { apiClient } from '@/lib/api-client';
import type { Background, CanvasElement, ImageElement, Slide, StoryState } from '../types/stories';

export interface StoryResponse {
    id: number;
    visibility: string;
    duration: number;
    hidden_from: number[];
    slides: unknown[];
    created_at: string;
    expires_at: string;
}

interface StoryMediaResponse {
    url: string;
    media_type: 'image' | 'video';
}

async function uploadBlobUrl(url: string): Promise<{ key: string; url: string; mediaType: string }> {
    const blob = await fetch(url).then((r) => r.blob());
    const file = new File([blob], 'story-media', { type: blob.type });
    const res = await apiClient.upload<{ data: StoryMediaResponse }>('/stories/media', file);
    return { key: res.data.key, url: res.data.url, mediaType: res.data.media_type };
}

async function resolveBackground(background: Background | null): Promise<Background | null> {
    if (!background || background.kind !== 'media' || !background.url.startsWith('blob:')) {
        return background;
    }

    const upload = await uploadBlobUrl(background.url);

    return {
        kind: 'media',
        // store object key in slide JSON; keep preview URL for immediate display
        url: upload.key,
        preview: upload.url,
        mediaType: upload.mediaType as 'image' | 'video',
    } as Background;
}

async function resolveElement(element: CanvasElement): Promise<CanvasElement> {
    if (element.type !== 'image' || !element.url.startsWith('blob:')) {
        return element;
    }
    const upload = await uploadBlobUrl(element.url);
    return { ...element, url: upload.key, preview: upload.url } as ImageElement;
}

async function resolveSlide(slide: Slide): Promise<Slide> {
    const background = await resolveBackground(slide.background);
    const elements = await Promise.all(slide.elements.map(resolveElement));
    return { ...slide, background, elements };
}

export const storiesActions = {
    async publish(state: StoryState): Promise<StoryResponse> {
        const slides = await Promise.all(state.slides.map(resolveSlide));

        const res = await apiClient.post<{ data: StoryResponse }>('/stories', {
            slides,
            visibility: state.visibility,
            duration: state.duration,
            hidden_from: state.hiddenFrom,
        });

        return res.data;
    },

    async listMine(): Promise<StoryResponse[]> {
        const res = await apiClient.get<{ data: StoryResponse[] }>('/stories/me');
        return res.data;
    },

    async listFeed(): Promise<StoryResponse[]> {
        const res = await apiClient.get<{ data: StoryResponse[] }>('/stories/feed');
        return res.data;
    },

    async view(storyId: number, slideIndex?: number): Promise<void> {
        await apiClient.post(`/stories/${storyId}/view`, { slide_index: slideIndex });
    },

    async like(storyId: number): Promise<void> {
        await apiClient.post(`/stories/${storyId}/like`);
    },

    async unlike(storyId: number): Promise<void> {
        await apiClient.post(`/stories/${storyId}/unlike`);
    },

    async reply(storyId: number, message: string): Promise<void> {
        await apiClient.post(`/stories/${storyId}/reply`, { message });
    },

    async remove(id: number): Promise<void> {
        await apiClient.delete(`/stories/${id}`);
    },
};