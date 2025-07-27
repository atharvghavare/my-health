import CONFIG from './config.js';

// DOM Elements
const adviceForm = document.getElementById('advice-form');
const userInput = document.getElementById('user-input');
const adviceResponse = document.getElementById('advice-response');
const responseContent = adviceResponse.querySelector('.response-content');
const categoryButtons = document.querySelectorAll('.category-btn');

// Loading indicator
const loadingIndicator = document.createElement('div');
loadingIndicator.className = 'loading-indicator';
loadingIndicator.innerHTML = `
    <div class="loading-spinner"></div>
    <p>Getting health advice...</p>
`;

// Predefined category advice
const categoryAdvice = {
    nutrition: `
        <h3>🥗 Nutrition Tips</h3>
        <ul>
            <li>Eat a variety of colorful fruits and vegetables daily</li>
            <li>Choose whole grains over refined grains</li>
            <li>Include lean proteins like fish, chicken, and beans</li>
            <li>Limit processed foods and added sugars</li>
            <li>Stay hydrated with plenty of water</li>
            <li>Practice portion control</li>
        </ul>
    `,
    exercise: `
        <h3>💪 Exercise Recommendations</h3>
        <ul>
            <li>Aim for 150 minutes of moderate activity per week</li>
            <li>Include both cardio and strength training</li>
            <li>Start slowly and gradually increase intensity</li>
            <li>Take rest days for recovery</li>
            <li>Find activities you enjoy to stay motivated</li>
            <li>Incorporate movement throughout your day</li>
        </ul>
    `,
    sleep: `
        <h3>😴 Sleep Hygiene Tips</h3>
        <ul>
            <li>Maintain a consistent sleep schedule</li>
            <li>Create a relaxing bedtime routine</li>
            <li>Keep your bedroom cool, dark, and quiet</li>
            <li>Limit screen time before bed</li>
            <li>Avoid caffeine late in the day</li>
            <li>Get 7-9 hours of sleep each night</li>
        </ul>
    `,
    mental: `
        <h3>🧠 Mental Health Support</h3>
        <ul>
            <li>Practice daily mindfulness or meditation</li>
            <li>Stay connected with friends and family</li>
            <li>Set healthy boundaries</li>
            <li>Take regular breaks from work</li>
            <li>Engage in hobbies you enjoy</li>
            <li>Seek professional help when needed</li>
        </ul>
    `,
    hydration: `
        <h3>💧 Hydration Guidelines</h3>
        <ul>
            <li>Drink water throughout the day, not just when thirsty</li>
            <li>Aim for 8 glasses of water daily</li>
            <li>Monitor your urine color (pale yellow is ideal)</li>
            <li>Increase intake during exercise and hot weather</li>
            <li>Eat water-rich foods like fruits and vegetables</li>
            <li>Carry a reusable water bottle</li>
        </ul>
    `,
    stress: `
        <h3>🧘 Stress Relief Techniques</h3>
        <ul>
            <li>Practice deep breathing exercises</li>
            <li>Try progressive muscle relaxation</li>
            <li>Take regular breaks during work</li>
            <li>Engage in physical activity</li>
            <li>Maintain a healthy work-life balance</li>
            <li>Consider yoga or meditation</li>
        </ul>
    `
};

// AI interaction function (only for text input)
async function getAIResponse(prompt) {
    try {
        console.log('Making request to Groq API for:', prompt);

        const response = await fetch(CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.GROQ_API_KEY}`
            },
            body: JSON.stringify({
                model: CONFIG.MODEL,
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful health assistant. ALWAYS respond in bullet points or numbered lists. Keep responses concise (maximum 5-6 points). Provide clear, accurate health advice. Always encourage consulting healthcare professionals for serious concerns. Format your response with bullet points (•) or numbers."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 300,
                temperature: 0.3,
                top_p: 1,
                stop: null
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        if (!data.choices?.[0]?.message?.content) {
            throw new Error('Invalid response format from API');
        }

        const responseText = data.choices[0].message.content.trim();
        
        if (responseText.length < 10) {
            throw new Error('Received invalid response from AI');
        }

        return responseText;
    } catch (error) {
        console.error('Error in getAIResponse:', error);
        throw error;
    }
}

// Show loading state
function showLoading() {
    responseContent.innerHTML = '';
    adviceResponse.classList.remove('hidden');
    adviceResponse.classList.add('visible');
    responseContent.appendChild(loadingIndicator);
}

// Show error message
function showError(error) {
    responseContent.innerHTML = `
        <div class="error-message">
            <p>I apologize, but I encountered an error processing your request.</p>
            <p>Please try again or select one of the category buttons for specific advice.</p>
            <p><small>Technical details: ${error.message}</small></p>
        </div>
    `;
}

// Show category advice
function showCategoryAdvice(category) {
    responseContent.innerHTML = categoryAdvice[category] || 'No advice available for this category.';
    adviceResponse.classList.remove('hidden');
    adviceResponse.classList.add('visible');
}

// Type writer effect
function typeWriter(text, element, speed = 30) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            if (text.charAt(i) === '\n') {
                element.innerHTML += '<br>';
            } else {
                element.innerHTML += text.charAt(i);
            }
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Handle form submission (uses AI)
adviceForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const question = userInput.value.trim();
    
    if (!question) return;

    showLoading();

    try {
        const aiResponse = await getAIResponse(question);
        responseContent.innerHTML = '';
        typeWriter(aiResponse, responseContent);
    } catch (error) {
        showError(error);
    }
    
    adviceForm.reset();
});

// Handle category button clicks (shows predefined tips)
categoryButtons.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.dataset.category;
        showCategoryAdvice(category);
    });
});

// Initialize health tips
const healthTips = [
    {
        title: 'Start Your Day Right',
        icon: '🌅',
        content: 'Begin each morning with a glass of water to kickstart your metabolism and hydrate your body after hours of sleep.'
    },
    {
        title: 'Move More',
        icon: '🚶',
        content: 'Take regular breaks to stand up and move around, especially if you spend long hours sitting.'
    },
    {
        title: 'Mindful Eating',
        icon: '🥗',
        content: 'Practice mindful eating by chewing slowly and paying attention to your food\'s flavors and textures.'
    },
    {
        title: 'Quality Sleep',
        icon: '😴',
        content: 'Aim for 7-9 hours of quality sleep each night to support your physical and mental health.'
    },
    {
        title: 'Mental Wellness',
        icon: '🧘',
        content: 'Take 10 minutes daily for meditation or deep breathing exercises to reduce stress and improve mental clarity.'
    },
    {
        title: 'Social Connection',
        icon: '👥',
        content: 'Maintain regular social connections with friends and family, as strong relationships are vital for overall well-being.'
    }
];

// Initialize tips on page load
document.addEventListener('DOMContentLoaded', () => {
    const tipsContainer = document.querySelector('.tips-container');
    tipsContainer.innerHTML = '';
    
    healthTips.forEach((tip, index) => {
        const tipCard = document.createElement('div');
        tipCard.className = 'tip-card';
        tipCard.style.opacity = '0';
        tipCard.style.transform = 'translateY(20px)';
        
        tipCard.innerHTML = `
            <span class="tip-icon">${tip.icon}</span>
            <h3>${tip.title}</h3>
            <p>${tip.content}</p>
        `;
        
        tipsContainer.appendChild(tipCard);
        
        setTimeout(() => {
            tipCard.style.transition = 'all 0.3s ease';
            tipCard.style.opacity = '1';
            tipCard.style.transform = 'translateY(0)';
        }, index * 100);
    });
}); 