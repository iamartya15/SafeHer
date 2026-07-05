const { GoogleGenerativeAI } = require('@google/generative-ai');

const isGeminiConfigured = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_google_gemini_api_key_here';

let genAI;
let model;

const SYSTEM_INSTRUCTION = 
  "You are SafeHer AI, an emergency women's safety companion. Provide extremely concise, practical, actionable safety advice for women in distress. " +
  "If the user is in immediate danger, remind them to trigger the SOS button and call emergency services first. Avoid long paragraphs; use markdown bullet points.";

if (isGeminiConfigured) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    model = genAI.getGenerativeModel({ 
      model: modelName,
      systemInstruction: SYSTEM_INSTRUCTION
    });
    console.log(`Gemini API initialized successfully with model: ${modelName}`);
  } catch (error) {
    console.error('Failed to initialize Gemini API:', error.message);
  }
} else {
  console.warn('GEMINI_API_KEY is not set. Using rule-based safety assistant fallback.');
}

// Fallback rule responses
const getFallbackSafetyResponse = (userPrompt) => {
  const prompt = userPrompt.toLowerCase();
  
  if (prompt.includes('follow') || prompt.includes('stalk') || prompt.includes('someone is behind me')) {
    return `🚨 **IMMEDIATE ACTION GUIDELINES (Someone is following you):**
1. **Change Directions:** Cross the street or walk in the opposite direction. If they cross too, confirm they are following you.
2. **Head to a Safe Place:** Walk towards a well-lit, crowded area, like a convenience store, police station, pharmacy, or open restaurant. Do NOT go home.
3. **Stay Visible & Loud:** If they get close, yell "Back off!" or make noise. Draw attention to yourself.
4. **Call for Help:** Use the SafeHer SOS trigger immediately to notify your guardians. Call local police (100 or 112).
5. **Keep Moving:** Do not look down at your phone for long. Keep your eyes on your surroundings.`;
  }
  
  if (prompt.includes('alone') || prompt.includes('night') || prompt.includes('walk')) {
    return `🚶‍♀️ **SAFETY GUIDELINES FOR WALKING ALONE:**
1. **Stay Alert:** Avoid wearing headphones or looking down at your phone. Be aware of your surroundings.
2. **Stick to Well-Lit Paths:** Walk along main roads that are illuminated and have active shops or traffic.
3. **Keep Guardians Updated:** Share your live status or trigger a dummy alert to let them know you're in transit.
4. **Confidence:** Walk with purpose, maintaining a firm pace and upright posture.
5. **Emergency Readiness:** Keep your phone in your hand with the SafeHer app open, ready to press the SOS button.`;
  }

  if (prompt.includes('unsafe') || prompt.includes('scared') || prompt.includes('danger')) {
    return `⚠️ **SAFETY GUIDELINES - FEELING UNSAFE:**
1. **Trust Your Instincts:** If a situation or place feels wrong, leave immediately. Your gut feeling is your best defense.
2. **Make a Call:** Pretend to be on a call, or call a guardian/friend. Say: *"I am at [Current Street] and will see you in 2 minutes."* to signal you are being met.
3. **Find Safe Places:** Look for open shops, pharmacies, or petrol pumps. Stay near the staff.
4. **Prepare SOS:** Have the SafeHer SOS page open. Ensure your phone volume is up.
5. **Avoid isolated areas:** Stay away from dark alleys, empty parks, or parking lots.`;
  }

  // Default response
  return `🛡️ **SafeHer AI Emergency Companion:**
I am here to help you navigate safety situations.
- If you feel you are in **immediate danger**, please trigger the **SOS Button** on the dashboard or call **100/112**.
- Tell me more about your situation. For example, say *"I think someone is following me"*, *"I'm walking alone in the dark"*, or *"I feel unsafe"* to get specific guidance.
- Remember: Trust your instincts, head towards crowded places, and keep your phone ready.`;
};

/**
 * Gets safety advice from Gemini API or falls back to rules
 * @param {string} prompt - User query
 * @param {Array} chatHistory - Past messages for context
 * @param {string} locationContext - Hidden context containing user's location
 * @returns {Promise<string>}
 */
const getSafetyAdvice = async (prompt, chatHistory = [], locationContext = '') => {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt must be a non-empty string');
  }

  if (isGeminiConfigured && model) {
    try {
      // Format simple history for Gemini API
      const formattedHistory = chatHistory.slice(-6).map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      // Start chat session
      const chat = model.startChat({
        history: formattedHistory,
        generationConfig: {
          maxOutputTokens: 500,
        }
      });

      // Inject locationContext if available
      const finalPrompt = locationContext ? `${locationContext}\n\nUSER PROMPT: ${prompt}` : prompt;

      const result = await chat.sendMessage(finalPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error, falling back to local guidance rules:', error.message);
      return getFallbackSafetyResponse(prompt);
    }
  } else {
    // Fallback if API key is not configured
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getFallbackSafetyResponse(prompt));
      }, 500); // Mock network latency
    });
  }
};

module.exports = {
  getSafetyAdvice,
  isGeminiConfigured
};
