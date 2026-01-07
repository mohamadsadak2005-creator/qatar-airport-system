import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { healthAPI, aiAPI } from '../services/api';

const HealthDataContext = createContext();

export const useHealthData = () => {
  const context = useContext(HealthDataContext);
  if (!context) {
    throw new Error('useHealthData must be used within a HealthDataProvider');
  }
  return context;
};

export const HealthDataProvider = ({ children }) => {
  const [healthData, setHealthData] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadHealthData();
    }
  }, [user]);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      // Try to fetch from backend first
      const records = await healthAPI.getRecords(user?.id);
      setHealthData(Array.isArray(records) ? records : records.data || []);
    } catch (error) {
      console.error('Failed to load health data from backend:', error);
      // Fallback to localStorage
      const data = JSON.parse(localStorage.getItem(`healthData_${user?.id}`) || '[]');
      setHealthData(data);
    } finally {
      setLoading(false);
    }
  };

  const saveHealthData = (data) => {
    localStorage.setItem(`healthData_${user?.id}`, JSON.stringify(data));
  };

  const addHealthRecord = async (record) => {
    try {
      setLoading(true);
      
      const recordData = {
        ...record,
        userId: user.id
      };

      // Try to save to backend first
      let newRecord;
      try {
        const response = await healthAPI.addRecord(recordData);
        newRecord = response.data || response;
      } catch (error) {
        console.error('Failed to save to backend:', error);
        // Fallback to local storage
        newRecord = {
          id: Date.now().toString(),
          ...recordData,
          timestamp: new Date().toISOString(),
        };
      }

      const updatedData = [newRecord, ...healthData];
      setHealthData(updatedData);
      saveHealthData(updatedData);

      // Get AI analysis
      let analysis;
      try {
        const aiResponse = await aiAPI.analyzeHealth(recordData);
        analysis = aiResponse.data || aiResponse;
      } catch (error) {
        console.error('Failed to get AI analysis:', error);
        // Fallback to local analysis
        analysis = await generateLocalAnalysis(record);
      }
      setAiAnalysis(analysis);

      return { success: true, data: newRecord, analysis };
    } catch (error) {
      console.error('Error adding health record:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const generateLocalAnalysis = async (record) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const analysis = {
          summary: `تحليل القراءات: سكر الدم ${record.sugar} mg/dL، ضغط الدم ${record.systolic}/${record.diastolic} mmHg`,
          suggestions: generateSuggestions(record),
          riskLevel: calculateRiskLevel(record),
          timestamp: new Date().toISOString()
        };
        resolve(analysis);
      }, 1500);
    });
  };

  const generateSuggestions = (record) => {
    const suggestions = [];
    
    if (record.sugar > 126) {
      suggestions.push({
        type: 'danger',
        icon: '🚨',
        title: 'سكر الدم مرتفع',
        message: 'مستوى السكر مرتفع. يرجى مراجعة الطبيب ومراقبة النظام الغذائي.'
      });
    } else if (record.sugar < 70) {
      suggestions.push({
        type: 'danger',
        icon: '🚨',
        title: 'سكر الدم منخفض',
        message: 'مستوى السكر منخفض. يرجى تناول وجبة خفيفة تحتوي على السكريات.'
      });
    }

    if (record.systolic > 130 || record.diastolic > 85) {
      suggestions.push({
        type: 'warning',
        icon: '⚠️',
        title: 'ضغط الدم مرتفع',
        message: 'ضغط الدم أعلى من الطبيعي. يوصى بممارسة الرياضة وتقليل الملح.'
      });
    }

    if (!suggestions.length) {
      suggestions.push({
        type: 'success',
        icon: '✅',
        title: 'قراءات جيدة',
        message: 'جميع القراءات ضمن المستويات الطبيعية. استمر في العادات الصحية.'
      });
    }

    return suggestions;
  };

  const calculateRiskLevel = (record) => {
    let score = 0;
    if (record.sugar > 126) score += 2;
    if (record.sugar > 200) score += 3;
    if (record.systolic > 130) score += 1;
    if (record.systolic > 140) score += 2;
    if (record.diastolic > 85) score += 1;
    if (record.diastolic > 90) score += 2;

    if (score >= 5) return { level: 'high', color: '#d32f2f' };
    if (score >= 3) return { level: 'medium', color: '#ff9800' };
    return { level: 'low', color: '#4caf50' };
  };

  const getLatestRecord = () => {
    return healthData[0] || null;
  };

  const getStats = () => {
    if (healthData.length === 0) return null;

    const latest = getLatestRecord();
    const avgSugar = healthData.reduce((sum, item) => sum + item.sugar, 0) / healthData.length;
    const avgSystolic = healthData.reduce((sum, item) => sum + item.systolic, 0) / healthData.length;
    const avgDiastolic = healthData.reduce((sum, item) => sum + item.diastolic, 0) / healthData.length;

    return {
      latest,
      averages: {
        sugar: avgSugar.toFixed(1),
        systolic: avgSystolic.toFixed(1),
        diastolic: avgDiastolic.toFixed(1)
      },
      totalReadings: healthData.length,
      lastUpdate: latest?.timestamp
    };
  };

  const value = {
    healthData,
    aiAnalysis,
    loading,
    addHealthRecord,
    getLatestRecord,
    getStats,
    loadHealthData
  };

  return (
    <HealthDataContext.Provider value={value}>
      {children}
    </HealthDataContext.Provider>
  );
};