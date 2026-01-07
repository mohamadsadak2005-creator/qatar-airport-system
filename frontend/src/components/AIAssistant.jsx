import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Brain, Zap, Heart } from 'lucide-react';
import { useHealthData } from '../contexts/HealthDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-toastify';
import { aiAPI } from '../services/api';

const AIAssistant = () => {
  const { aiAnalysis, getLatestRecord } = useHealthData();
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Load conversation history
    const savedMessages = localStorage.getItem('ai_conversation');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Initial welcome message
      setMessages([{
        id: 1,
        role: 'assistant',
        content: t('ai.welcome')
      }]);
    }
  }, [t]);

  useEffect(() => {
    // Save conversation
    localStorage.setItem('ai_conversation', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const callGeminiAPI = async (userMessage) => {
    try {
      const response = await aiAPI.chat(userMessage);
      
      if (response.success) {
        return response.data.response;
      } else {
        throw new Error(response.error || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('AI API Error:', error);
      
      // Fallback to simulated response if API fails
      return await simulateAIResponse(userMessage);
    }
  };

  const generateHealthAdvice = (record) => {
    let advice = '';

    if (record.sugar > 126) {
      advice += `• ${t('status.high')} ${t('dashboard.bloodSugar')}. ${language === 'ar' ? 'يرجى مراجعة الطبيب ومراقبة النظام الغذائي.' : 'Please consult a doctor and monitor your diet.'}\n`;
      advice += `• ${language === 'ar' ? 'قلل من السكريات والنشويات.' : 'Reduce sugars and carbohydrates.'}\n`;
      advice += `• ${language === 'ar' ? 'مارس الرياضة بانتظام.' : 'Exercise regularly.'}\n`;
    } else if (record.sugar < 70) {
      advice += `• ${t('status.low')} ${t('dashboard.bloodSugar')}. ${language === 'ar' ? 'يرجى تناول وجبة خفيفة فوراً.' : 'Please have a snack immediately.'}\n`;
    } else {
      advice += `• ${t('status.normal')} ${t('dashboard.bloodSugar')}. ${language === 'ar' ? 'استمر في العادات الصحية.' : 'Continue healthy habits.'}\n`;
    }

    if (record.systolic > 130 || record.diastolic > 85) {
      advice += `• ${t('status.high')} ${t('dashboard.bloodPressure')}. ${language === 'ar' ? 'يوصى بتقليل الملح وممارسة الرياضة.' : 'It is recommended to reduce salt and exercise.'}\n`;
    }

    return advice;
  };

  const simulateAIResponse = async (userMessage) => {
    // Simulate API call to DeepSeek AI
    return new Promise((resolve) => {
      setTimeout(() => {
        const healthRecord = getLatestRecord();
        if (healthRecord) {
          const analysis = `
${t('ai.analysisSummary')}
- ${t('dashboard.bloodSugar')}: ${healthRecord.sugar} ${t('common.mgDL')}
- ${t('dashboard.bloodPressure')}: ${healthRecord.systolic}/${healthRecord.diastolic} ${t('common.mmHg')}
- ${t('dashboard.weight')}: ${healthRecord.weight || t('common.notSpecified')} ${t('common.kg')}

${generateHealthAdvice(healthRecord)}
          `;
          resolve(analysis);
        } else {
          const responses = language === 'ar' ? [
            `أنا أساعدك في تحليل بياناتك الصحية. بناءً على قراءتك الأخيرة، يمكنني تقديم النصائح المناسبة.`,
            `الصحة كنز، وأنا هنا لمساعدتك في الحفاظ على هذا الكنز. دعني أساعدك في فهم بياناتك الصحية بشكل أفضل.`,
            `تحليل البيانات الصحية مهم جداً. سأقدم لك توصيات مبنية على أحدث الأبحاث والممارسات الطبية.`,
            `كل شخص حالة خاصة. سأقوم بتحليل بياناتك وتقديم توصيات مخصصة تناسب حالتك الصحية.`
          ] : [
            `I help you analyze your health data. Based on your latest reading, I can provide appropriate advice.`,
            `Health is a treasure, and I'm here to help you maintain this treasure. Let me help you better understand your health data.`,
            `Health data analysis is very important. I will provide you with recommendations based on the latest research and medical practices.`,
            `Each person is a unique case. I will analyze your data and provide customized recommendations suitable for your health condition.`
          ];
          resolve(responses[Math.floor(Math.random() * responses.length)]);
        }
      }, 1500);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const aiResponse = await callGeminiAPI(input);
      
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiResponse
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      label: t('ai.analyzeReadings'),
      icon: <Brain size={16} />,
      action: async () => {
        const record = getLatestRecord();
        if (!record) {
          toast.info(t('ai.noReadings'));
          return;
        }

        const message = {
          id: Date.now(),
          role: 'user',
          content: language === 'ar' ? 'قم بتحليل آخر قراءاتي الصحية' : 'Analyze my latest health readings'
        };

        setMessages(prev => [...prev, message]);
        setLoading(true);

        const analysis = await callGeminiAPI('تحليل القراءات');
        const response = {
          id: Date.now() + 1,
          role: 'assistant',
          content: analysis
        };

        setMessages(prev => [...prev, response]);
        setLoading(false);
      }
    },
    {
      label: t('ai.sugarTips'),
      icon: <Zap size={16} />,
      action: async () => {
        const message = {
          id: Date.now(),
          role: 'user',
          content: language === 'ar' ? 'أعطني نصائح للتحكم في مستوى السكر' : 'Give me tips for controlling blood sugar'
        };

        setMessages(prev => [...prev, message]);
        setLoading(true);

        const tips = language === 'ar' ? `
${t('ai.sugarControlTips')}:

1. النظام الغذائي:
   • تناول وجبات صغيرة متكررة
   • قلل من السكريات المكررة
   • زد من الألياف الغذائية
   • اختر الكربوهيدرات المعقدة

2. النشاط البدني:
   • مارس الرياضة 30 دقيقة يومياً
   • المشي بعد الوجبات
   • تمارين المقاومة 2-3 مرات أسبوعياً

3. المراقبة:
   • قياس السكر بانتظام
   • تسجيل القراءات
   • متابعة مع الطبيب

4. العادات الصحية:
   • النوم الكافي
   • التحكم في التوتر
   • الإقلاع عن التدخين
        ` : `
${t('ai.sugarControlTips')}:

1. Diet:
   • Eat small, frequent meals
   • Reduce refined sugars
   • Increase dietary fiber
   • Choose complex carbohydrates

2. Physical Activity:
   • Exercise 30 minutes daily
   • Walk after meals
   • Resistance exercises 2-3 times weekly

3. Monitoring:
   • Measure sugar regularly
   • Record readings
   • Follow up with doctor

4. Healthy Habits:
   • Adequate sleep
   • Stress management
   • Quit smoking
        `;

        const response = {
          id: Date.now() + 1,
          role: 'assistant',
          content: tips
        };

        setMessages(prev => [...prev, response]);
        setLoading(false);
      }
    },
    {
      label: t('ai.dietPlan'),
      icon: <Heart size={16} />,
      action: async () => {
        const message = {
          id: Date.now(),
          role: 'user',
          content: language === 'ar' ? 'اقترح نظاماً غذائياً صحياً' : 'Suggest a healthy diet plan'
        };

        setMessages(prev => [...prev, message]);
        setLoading(true);

        const diet = language === 'ar' ? `
${t('ai.healthyDiet')}:

الفطور (7-8 صباحاً):
• شوفان مع حليب قليل الدسم
• بيضة مسلوقة
• خضار طازجة
• كوب شاي أو قهوة بدون سكر

وجبة خفيفة (10 صباحاً):
• تفاحة أو موزة
• حفنة من المكسرات

الغداء (1-2 ظهراً):
• صدر دجاج مشوي
• أرز بني
• سلطة خضراء
• خضار مطبوخة

وجبة خفيفة (4 عصراً):
• زبادي يوناني
• ثمرة فاكهة

العشاء (7-8 مساءً):
• سمك مشوي
• خضار مشوية
• شوربة خضار

ملاحظات:
• اشرب 8 أكواب ماء يومياً
• تجنب المشروبات الغازية
• قلل من الملح والدهون
        ` : `
${t('ai.healthyDiet')}:

Breakfast (7-8 AM):
• Oatmeal with low-fat milk
• Boiled egg
• Fresh vegetables
• Cup of tea or coffee without sugar

Snack (10 AM):
• Apple or banana
• Handful of nuts

Lunch (1-2 PM):
• Grilled chicken breast
• Brown rice
• Green salad
• Cooked vegetables

Snack (4 PM):
• Greek yogurt
• Fruit

Dinner (7-8 PM):
• Grilled fish
• Grilled vegetables
• Vegetable soup

Notes:
• Drink 8 glasses of water daily
• Avoid soft drinks
• Reduce salt and fats
        `;

        const response = {
          id: Date.now() + 1,
          role: 'assistant',
          content: diet
        };

        setMessages(prev => [...prev, response]);
        setLoading(false);
      }
    }
  ];

  const clearConversation = () => {
    setMessages([{
      id: 1,
      role: 'assistant',
      content: t('ai.welcome')
    }]);
    localStorage.removeItem('ai_conversation');
  };

  return (
    <div className="ai-assistant">
      <div className="card">
        <h2><Bot /> {t('ai.title')}</h2>
        
        {aiAnalysis && (
          <div className="current-analysis">
            <h4>{t('ai.currentAnalysis')}</h4>
            <div className="analysis-content">
              <p>{aiAnalysis.summary}</p>
            </div>
          </div>
        )}

        <div className="chat-container">
          <div className="messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.role}`}
              >
                <div className="message-avatar">
                  {message.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                </div>
                <div className="message-content">
                  {message.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant">
                <div className="message-avatar">
                  <Bot size={20} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="quick-actions">
            <h4>{t('ai.quickActions')}</h4>
            <div className="actions-grid">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="action-btn"
                  onClick={action.action}
                  disabled={loading}
                >
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
              <button
                className="action-btn secondary"
                onClick={clearConversation}
              >
                <Sparkles size={16} />
                <span>{t('ai.newChat')}</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('ai.typeQuestion')}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              <Send />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;