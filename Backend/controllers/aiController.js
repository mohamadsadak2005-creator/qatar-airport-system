import geminiService from '../services/geminiService.js';
import { validationResult } from 'express-validator';

class AIController {
  
  /**
   * @desc    إرسال رسالة إلى Gemini AI
   * @route   POST /api/ai/chat
   */
  async chat(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array()
        });
      }

      const { message, model = 'gemini-2.5-flash', temperature = 0.7, max_tokens = 2000 } = req.body;

      const result = await geminiService.generateResponse(message, {
        model,
        temperature: parseFloat(temperature),
        max_tokens: parseInt(max_tokens),
        userId: req.user?.id
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        data: {
          response: result.response,
          usage: result.usage,
          model: result.model
        }
      });

    } catch (error) {
      console.error('AI Chat Error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في خدمة الذكاء الاصطناعي'
      });
    }
  }

  /**
   * @desc    محادثة مع الذاكرة (Chat with context)
   * @route   POST /api/ai/conversation
   */
  async conversation(req, res) {
    try {
      const { messages, model = 'gemini-2.5-flash' } = req.body;

      // بناء محادثة مع السياق
      const conversationPrompt = this.buildConversationPrompt(messages);

      const result = await geminiService.generateResponse(conversationPrompt, {
        model,
        userId: req.user?.id
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        data: {
          response: result.response,
          usage: result.usage
        }
      });

    } catch (error) {
      console.error('AI Conversation Error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في خدمة المحادثة'
      });
    }
  }

  /**
   * @desc    توليد صور (إذا مدعوم)
   * @route   POST /api/ai/generate-image
   */
  async generateImage(req, res) {
    try {
      const { prompt, size = '1024x1024', quality = 'standard' } = req.body;

      const result = await geminiService.generateImage(prompt, {
        size,
        quality,
        userId: req.user?.id
      });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        data: {
          images: result.images,
          created: result.created
        }
      });

    } catch (error) {
      console.error('AI Image Generation Error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في توليد الصور'
      });
    }
  }

  /**
   * @desc    تحليل النص
   * @route   POST /api/ai/analyze
   */
  async analyzeText(req, res) {
    try {
      const { text, analysisType = 'sentiment' } = req.body;

      const result = await geminiService.analyzeText(text, analysisType, req.user?.id);

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json({
        success: true,
        data: {
          analysis: result.response,
          type: analysisType
        }
      });

    } catch (error) {
      console.error('AI Text Analysis Error:', error);
      res.status(500).json({
        success: false,
        error: 'خطأ في تحليل النص'
      });
    }
  }

  /**
   * @desc    بناء محادثة مع السياق
   */
  buildConversationPrompt(messages) {
    let prompt = "محادثة سابقة:\n";
    
    messages.forEach((msg, index) => {
      const role = msg.role === 'user' ? 'المستخدم' : 'المساعد';
      prompt += `${role}: ${msg.content}\n`;
    });

    prompt += "\nبناءً على المحادثة السابقة، الرجاء الرد بشكل مناسب:";
    
    return prompt;
  }
}

export default new AIController();