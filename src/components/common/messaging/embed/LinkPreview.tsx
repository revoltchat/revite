import { memo } from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import styles from "./Embed.module.scss";
import classNames from "classnames";

interface LinkPreviewData {
    title?: string;
    description?: string;
    image?: string;
    url: string;
    siteName?: string;
    favicon?: string;
    videoId?: string; // For YouTube videos
}

interface Props {
    url: string;
}

// YouTube URL detector
const YOUTUBE_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;

// Simple URL detector
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

// Function to fetch metadata from URL with timeout
async function fetchMetadata(url: string): Promise<Partial<LinkPreviewData>> {
    try {
        // Use a CORS proxy service to fetch metadata with timeout
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        const response = await fetch(proxyUrl, {
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
            }
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (!data.contents) return {};

        const html = data.contents;
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // Extract Open Graph or meta tags
        const getMetaContent = (property: string, attribute = 'property') => {
            const element = doc.querySelector(`meta[${attribute}="${property}"]`);
            return element?.getAttribute('content') || '';
        };

        const title = getMetaContent('og:title') ||
            getMetaContent('twitter:title') ||
            doc.querySelector('title')?.textContent || '';

        const description = getMetaContent('og:description') ||
            getMetaContent('twitter:description') ||
            getMetaContent('description', 'name') || '';

        const image = getMetaContent('og:image') ||
            getMetaContent('twitter:image') || '';

        const siteName = getMetaContent('og:site_name') || '';

        return {
            title: title.trim(),
            description: description.trim(),
            image: image,
            siteName: siteName || new URL(url).hostname
        };
    } catch (error) {
        console.warn('Failed to fetch metadata for:', url, error);
        return {};
    }
}

function extractYouTubeId(url: string): string | null {
    const match = url.match(YOUTUBE_REGEX);
    return match ? match[1] : null;
}

async function createYouTubePreview(videoId: string, url: string): Promise<LinkPreviewData> {
    // For YouTube, use a reliable fallback approach
    // YouTube often blocks metadata fetching, so we'll use their oEmbed API
    try {
        const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for YouTube

        const response = await fetch(oEmbedUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            return {
                title: data.title || "YouTube Video",
                description: `by ${data.author_name || 'YouTube'} • Click to watch`,
                image: data.thumbnail_url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
                url,
                siteName: "YouTube",
                favicon: "https://www.youtube.com/s/desktop/f506bd45/img/favicon_32x32.png",
                videoId: videoId
            };
        }
    } catch (error) {
        console.warn('YouTube oEmbed failed:', error);
    }

    // Fallback to basic preview
    return {
        title: "YouTube Video",
        description: "Click to watch on YouTube",
        image: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        url,
        siteName: "YouTube",
        favicon: "https://www.youtube.com/s/desktop/f506bd45/img/favicon_32x32.png",
        videoId: videoId
    };
}

async function createGenericPreview(url: string): Promise<LinkPreviewData> {
    try {
        const urlObj = new URL(url);

        // Add timeout for metadata fetching
        const metadataPromise = fetchMetadata(url);
        const timeoutPromise = new Promise<Partial<LinkPreviewData>>((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 6000);
        });

        const metadata = await Promise.race([metadataPromise, timeoutPromise]).catch(() => ({} as Partial<LinkPreviewData>));

        return {
            title: metadata?.title || urlObj.hostname,
            description: metadata?.description || "Click to open link",
            image: metadata?.image,
            url,
            siteName: metadata?.siteName || urlObj.hostname,
            favicon: `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`
        };
    } catch {
        return {
            title: "External Link",
            description: "Click to open link",
            url,
            siteName: "External Site"
        };
    }
}

export default memo(function LinkPreview({ url }: Props) {
    const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null);
    const [loading, setLoading] = useState(false);
    const [showPlayer, setShowPlayer] = useState(false);

    useEffect(() => {
        if (!url) return;

        let cancelled = false;
        setLoading(true);

        const loadPreview = async () => {
            try {
                console.log('Loading preview for:', url);
                // Check if it's a YouTube link
                const youtubeId = extractYouTubeId(url);
                let preview: LinkPreviewData;

                if (youtubeId) {
                    console.log('Detected YouTube video:', youtubeId);
                    // For YouTube, try oEmbed first, but don't wait too long
                    try {
                        preview = await Promise.race([
                            createYouTubePreview(youtubeId, url),
                            new Promise<LinkPreviewData>((resolve) => {
                                setTimeout(() => resolve({
                                    title: "YouTube Video",
                                    description: "Click to watch on YouTube",
                                    image: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
                                    url,
                                    siteName: "YouTube",
                                    favicon: "https://www.youtube.com/s/desktop/f506bd45/img/favicon_32x32.png",
                                    videoId: youtubeId
                                }), 3000); // 3 second fallback
                            })
                        ]);
                    } catch {
                        // Immediate fallback for YouTube
                        preview = {
                            title: "YouTube Video",
                            description: "Click to watch on YouTube",
                            image: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
                            url,
                            siteName: "YouTube",
                            favicon: "https://www.youtube.com/s/desktop/f506bd45/img/favicon_32x32.png",
                            videoId: youtubeId
                        };
                    }
                } else {
                    console.log('Loading generic preview for:', url);
                    preview = await createGenericPreview(url);
                }

                console.log('Preview loaded:', preview);

                if (!cancelled) {
                    setPreviewData(preview);
                    setLoading(false);
                }
            } catch (error) {
                console.warn('Failed to load preview for:', url, error);
                if (!cancelled) {
                    // Fallback to basic preview
                    const urlObj = new URL(url);
                    setPreviewData({
                        title: urlObj.hostname,
                        description: "Click to open link",
                        url,
                        siteName: urlObj.hostname
                    });
                    setLoading(false);
                }
            }
        };

        loadPreview();

        return () => {
            cancelled = true;
        };
    }, [url]);

    if (loading) {
        return (
            <div className={classNames(styles.embed, styles.website)} style={{ cursor: 'pointer', maxWidth: '550px', minHeight: '200px', padding: '20px', margin: '10px 0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', color: 'var(--secondary-foreground)' }}>
                        Loading preview...
                    </div>
                </div>
            </div>
        );
    }

    if (!previewData) {
        return null;
    }

    const handleClick = () => {
        if (previewData?.videoId) {
            setShowPlayer(!showPlayer);
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className={classNames(styles.embed, styles.website)} onClick={handleClick} style={{ cursor: 'pointer', maxWidth: '550px', minHeight: '200px', padding: '20px', margin: '10px 0', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
                {previewData.siteName && (
                    <div className={styles.siteinfo}>
                        {previewData.favicon && (
                            <img
                                loading="lazy"
                                className={styles.favicon}
                                src={previewData.favicon}
                                draggable={false}
                                onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                        )}
                        <div className={styles.site}>
                            {previewData.siteName}
                        </div>
                    </div>
                )}

                {previewData.title && (
                    <span>
                        <div className={styles.title} style={{ fontSize: '18px', fontWeight: '600', marginBottom: '10px' }}>
                            {previewData.title}
                        </div>
                    </span>
                )}

                {previewData.description && (
                    <div className={styles.description} style={{ fontSize: '15px', lineHeight: '1.4', color: 'var(--secondary-foreground)', maxHeight: '70px', overflow: 'hidden' }}>
                        {previewData.description.length > 300 ? previewData.description.substring(0, 300) + '...' : previewData.description}
                        {previewData.videoId && !showPlayer && (
                            <span style={{ marginLeft: '8px', color: 'var(--accent)', fontSize: '12px' }}>
                                • Click to play
                            </span>
                        )}
                    </div>
                )}
            </div>

            {previewData.image && (
                <div style={{ width: '100%', marginTop: '12px' }}>
                    {showPlayer && previewData.videoId ? (
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube-nocookie.com/embed/${previewData.videoId}?autoplay=1&modestbranding=1`}
                                title="YouTube video player"
                                frameBorder="0"
                                allowFullScreen
                                style={{ borderRadius: '8px' }}
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowPlayer(false);
                                }}
                                style={{
                                    position: 'absolute',
                                    top: '8px',
                                    right: '8px',
                                    background: 'rgba(0, 0, 0, 0.7)',
                                    border: 'none',
                                    color: 'white',
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ) : (
                        <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', minHeight: '200px' }}>
                            <img
                                className={styles.image}
                                src={previewData.image}
                                loading="lazy"
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px', display: 'block' }}
                                onError={(e) => (e.currentTarget.style.display = "none")}
                            />
                            {previewData.videoId && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        background: 'rgba(0, 0, 0, 0.8)',
                                        borderRadius: '50%',
                                        width: '70px',
                                        height: '70px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        zIndex: 10
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setShowPlayer(true);
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.9)';
                                        e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(0, 0, 0, 0.8)';
                                        e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
                                    }}
                                >
                                    <svg
                                        width="32"
                                        height="32"
                                        viewBox="0 0 24 24"
                                        fill="white"
                                        style={{ marginLeft: '4px' }}
                                    >
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});
