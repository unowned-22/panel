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

export interface FeedSlide {
    id: string;
    rendered_url?: string;
    seen?: boolean;
}

export interface FeedStoryResponse {
    id: number;
    user_id?: number;
    author_name?: string;
    author_username?: string;
    author_avatar?: string;
    visibility: string;
    duration: number;
    hidden_from: number[];
    slides: FeedSlide[];
    created_at: string;
    expires_at: string;
}

interface StoryMediaResponse {
    url: string;
    key: string;
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
    const resolved = { ...slide, background, elements };

    // Try to render and upload a composite image for quick viewing. Failure
    // should not block publication.
    try {
        const { renderSlideToBlob } = await import('../utils/renderSlide');
        const blob = await renderSlideToBlob(resolved);
        const file = new File([blob], 'rendered-slide.png', { type: 'image/png' });
        const up = await apiClient.upload<{ data: StoryMediaResponse }>('/stories/media', file);
        if (up && up.data && up.data.key) {
            return { ...resolved, rendered_url: up.data.key } as Slide;
        }
    } catch (err) {
        // non-fatal: continue without rendered_url
        // eslint-disable-next-line no-console
        console.warn('[stories] renderAndUploadSlide failed, skipping rendered_url:', err);
    }

    return resolved;
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

    async listFeed(): Promise<FeedStoryResponse[]> {
        const res = await apiClient.get<{ data: FeedStoryResponse[] }>('/stories/feed');
        return res.data;
    },

    async view(storyId: number, slideIndex?: number): Promise<void> {
        await apiClient.post(`/stories/${storyId}/view`, { slide_index: slideIndex });
    },

    async like(storyId: number): Promise<void> {
        await apiClient.post(`/stories/${storyId}/like`, undefined);
    },

    async unlike(storyId: number): Promise<void> {
        await apiClient.post(`/stories/${storyId}/unlike`, undefined);
    },

    async reply(storyId: number, message: string): Promise<void> {
        await apiClient.post(`/stories/${storyId}/reply`, { message });
    },

    async remove(id: number): Promise<void> {
        await apiClient.delete(`/stories/${id}`);
    },
};