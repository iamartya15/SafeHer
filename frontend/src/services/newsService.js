import axios from 'axios';
import { CURATED_NEWS } from '../data/verifiedData';

const GNEWS_API_KEY = import.meta.env.VITE_GNEWS_API_KEY || ''; 


export const getLatestNews = async (category = 'all', page = 1, limit = 6) => {
  try {
    let query = '"women safety" OR "women empowerment" india';
    if (category !== 'all') {
       query = `"women ${category.toLowerCase()}" india`;
    }

    // Try GNews
    if (GNEWS_API_KEY) {
      const res = await axios.get(`https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&country=in&max=${limit}&page=${page}&apikey=${GNEWS_API_KEY}`);
      if (res.data && res.data.articles && res.data.articles.length > 0) {
        return res.data.articles.map(article => ({
          title: article.title,
          description: article.description,
          source: article.source.name,
          publishedAt: article.publishedAt,
          url: article.url,
          urlToImage: article.image,
          category: category === 'all' ? 'Latest' : category
        }));
      }
    }
    
    // Fallback logic
    throw new Error('API Keys missing or limits reached');
  } catch (error) {
    console.warn('News API failed or rate-limited. Falling back to verified curated dataset.', error.message);
    
    // Simulate API delay for skeleton loaders
    await new Promise(resolve => setTimeout(resolve, 800));

    let filtered = CURATED_NEWS;
    if (category !== 'all') {
      filtered = CURATED_NEWS.filter(n => n.category.toLowerCase().includes(category.toLowerCase()));
    }
    
    // Simple pagination simulation for fallback
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return filtered.slice(start, end);
  }
};
