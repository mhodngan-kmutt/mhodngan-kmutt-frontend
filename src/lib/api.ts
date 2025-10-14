export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  created_at?: string;
}

// mock data
const mockPosts: Post[] = [
  {
    id: '1',
    slug: 'astro-getting-started',
    title: 'Getting Started with Astro',
    excerpt: 'Learn how to build fast and modern websites using Astro framework.',
    content: `
      <p>Astro is a modern static site builder that helps you create fast websites.</p>
      <p>It uses the concept of islands architecture and supports frameworks like React, Svelte, and Vue.</p>
    `,
    created_at: '2025-10-10',
  },
  {
    id: '2',
    slug: 'tailwind-integration',
    title: 'How to Use Tailwind CSS in Astro',
    excerpt: 'Set up Tailwind CSS in your Astro project quickly and easily.',
    content: `
      <p>Tailwind CSS can be integrated into Astro with just a few steps.</p>
      <ul>
        <li>Install Tailwind via pnpm</li>
        <li>Configure tailwind.config.mjs</li>
        <li>Import styles in layout</li>
      </ul>
    `,
    created_at: '2025-10-11',
  },
  {
    id: '3',
    slug: 'astro-i18n-guide',
    title: 'Astro i18n Setup Guide',
    excerpt: 'Implement i18n (multi-language support) with JSON translation files in Astro.',
    content: `
      <p>You can use <code>en.json</code> and <code>th.json</code> to handle text translation.</p>
      <p>Then switch languages dynamically without creating separate pages.</p>
    `,
    created_at: '2025-10-12',
  },
];

// Toggle mock mode / real API
const USE_MOCK = import.meta.env.PUBLIC_USE_MOCK === 'true';

function getApiUrl(): string {
  const apiUrl = import.meta.env.PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('PUBLIC_API_URL environment variable is not defined');
  }
  return apiUrl;
}

export async function getPosts(): Promise<Post[]> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 300)); // Simulate delay
    return mockPosts;
  }
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/posts`);
  if (!res.ok) {
    throw new Error(`Failed to fetch posts: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function getPostBySlug(slug: string): Promise<Post> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    const post = mockPosts.find((p) => p.slug === slug);
    if (!post) throw new Error(`Post not found: ${slug}`);
    return post;
  }
  const apiUrl = getApiUrl();
  const res = await fetch(`${apiUrl}/posts/${slug}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch post by slug: ${res.status} ${res.statusText}`);
  }
  return res.json();
}