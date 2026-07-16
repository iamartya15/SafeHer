const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

async function getIncidents() {
  const prompt = `List 15 recent real-world incidents (from news or reports) of harassment, theft, or stalking against women in major cities in India (Delhi, Mumbai, Bangalore, Pune, Hyderabad, etc.). For each incident provide: category (must be exactly one of: Harassment, Theft, Stalking, Poor Lighting, Unsafe Area, Road Issue), description (a short 1-2 sentence summary), address (a specific location in the city), latitude, and longitude. Return the output strictly as a JSON array of objects without any markdown formatting.`;
  
  try {
    const res = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
      contents: [{ parts: [{ text: prompt }] }]
    });
    
    let text = res.data.candidates[0].content.parts[0].text;
    text = text.replace(/```json/g, '').replace(/```/g, '');
    fs.writeFileSync('incidents_data.json', text);
    console.log('Successfully fetched and saved incidents.');
  } catch (error) {
    console.error('Error fetching from Gemini:', error.message);
  }
}
getIncidents();
