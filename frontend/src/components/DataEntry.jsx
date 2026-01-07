import React, { useState } from 'react';
import { Droplets, HeartPulse, Scale, MessageSquare, Send, AlertCircle } from 'lucide-react';
import { useHealthData } from '../contexts/HealthDataContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-toastify';

const DataEntry = () => {
  const { addHealthRecord, loading } = useHealthData();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    sugar: '',
    systolic: '',
    diastolic: '',
    weight: '',
    symptoms: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    if (!formData.sugar || formData.sugar < 20 || formData.sugar > 500) {
      toast.error(t('dataEntry.invalidSugar'));
      return false;
    }
    
    if (!formData.systolic || formData.systolic < 50 || formData.systolic > 250) {
      toast.error(t('dataEntry.invalidPressure'));
      return false;
    }
    
    if (!formData.diastolic || formData.diastolic < 30 || formData.diastolic > 150) {
      toast.error(t('dataEntry.invalidPressure'));
      return false;
    }
    
    if (formData.weight && (formData.weight < 20 || formData.weight > 300)) {
      toast.error(t('dataEntry.invalidWeight'));
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const record = {
      sugar: parseInt(formData.sugar),
      systolic: parseInt(formData.systolic),
      diastolic: parseInt(formData.diastolic),
      weight: formData.weight ? parseFloat(formData.weight) : null,
      symptoms: formData.symptoms
    };

    const result = await addHealthRecord(record);
    
    if (result.success) {
      toast.success(t('dataEntry.success'));
      setFormData({
        sugar: '',
        systolic: '',
        diastolic: '',
        weight: '',
        symptoms: ''
      });
    } else {
      toast.error(result.error || t('common.error'));
    }
  };

  return (
    <div className="data-entry">
      <div className="card">
        <h2>{t('dataEntry.title')}</h2>
        
        <div className="alert-bar info">
          <AlertCircle size={20} />
          <span>{t('dataEntry.aiAnalysis')}</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="sugar">
              <Droplets />
              {t('dataEntry.bloodSugar')}
            </label>
            <input
              type="number"
              id="sugar"
              name="sugar"
              value={formData.sugar}
              onChange={handleChange}
              placeholder={t('dataEntry.enterValue')}
              required
              min="20"
              max="500"
              disabled={loading}
            />
            <div className="input-hint">{t('dataEntry.bloodSugarHint')}</div>
          </div>

          <div className="input-group">
            <label>
              <HeartPulse />
              {t('dataEntry.bloodPressure')}
            </label>
            <div className="pressure-inputs">
              <input
                type="number"
                id="systolic"
                name="systolic"
                value={formData.systolic}
                onChange={handleChange}
                placeholder={t('dataEntry.systolic')}
                required
                min="50"
                max="250"
                disabled={loading}
              />
              <input
                type="number"
                id="diastolic"
                name="diastolic"
                value={formData.diastolic}
                onChange={handleChange}
                placeholder={t('dataEntry.diastolic')}
                required
                min="30"
                max="150"
                disabled={loading}
              />
            </div>
            <div className="input-hint">{t('dataEntry.bloodPressureHint')}</div>
          </div>

          <div className="input-group">
            <label htmlFor="weight">
              <Scale />
              {t('dataEntry.weight')}
            </label>
            <input
              type="number"
              id="weight"
              name="weight"
              value={formData.weight}
              onChange={handleChange}
              placeholder={t('dataEntry.enterWeight')}
              min="20"
              max="300"
              step="0.1"
              disabled={loading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="symptoms">
              <MessageSquare />
              {t('dataEntry.symptoms')}
            </label>
            <input
              type="text"
              id="symptoms"
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
              placeholder={t('dataEntry.symptomsPlaceholder')}
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className="btn primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                {t('dataEntry.analyzing')}
              </>
            ) : (
              <>
                <Send />
                {t('dataEntry.analyze')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DataEntry;