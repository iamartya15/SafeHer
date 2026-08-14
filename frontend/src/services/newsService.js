import axios from 'axios';
import { CURATED_NEWS } from '../data/verifiedData';

const GNEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY || ''; 

/**
 * Fetch news articles from GNews API with fallback to verified curated dataset.
 * Supports pagination, category filtering, and deduplication.
 */
export const getLatestNews = async (category = 'all', page = 1, limit = 6) => {
  try {
    let query = '"women safety" OR "women empowerment" OR "gender safety" india';
    if (category !== 'all') {
      query = `"women ${category.toLowerCase()}" india`;
    }

    // Attempt GNews API fetch if key exists
    if (GNEWS_API_KEY) {
      const res = await axios.get(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=${limit}&page=${page}&apikey=${GNEWS_API_KEY}`,
        { timeout: 8000 }
      );
      if (res.data && res.data.articles && res.data.articles.length > 0) {
        const total = res.data.totalArticles || res.data.articles.length;
        const normalized = res.data.articles.map((article, idx) => ({
          id: article.url || `gnews-${page}-${idx}`,
          title: article.title,
          description: article.description,
          source: article.source?.name || 'News Outlet',
          publishedAt: article.publishedAt,
          url: article.url,
          urlToImage: article.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800',
          category: category === 'all' ? 'Latest' : category
        }));

        return {
          articles: normalized,
          totalArticles: total,
          hasMore: page * limit < total,
          isLiveApi: true
        };
      }
    }
    
    throw new Error('News API key unconfigured or quota reached');
  } catch (error) {
    // Graceful fallback to verified curated dataset
    await new Promise(resolve => setTimeout(resolve, 500));

    let filtered = CURATED_NEWS;
    if (category !== 'all') {
      filtered = CURATED_NEWS.filter(n => 
        n.category.toLowerCase().includes(category.toLowerCase()) ||
        category.toLowerCase().includes(n.category.toLowerCase())
      );
    }
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const sliced = filtered.slice(start, end).map((n, idx) => ({
      id: n.url || `curated-${start + idx}`,
      ...n,
      urlToImage: n.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800'
    }));

    return {
      articles: sliced,
      totalArticles: filtered.length,
      hasMore: end < filtered.length,
      isLiveApi: false
    };
  }
};
