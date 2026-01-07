import React, { useState, useEffect } from 'react';
import { Droplets, HeartPulse, Scale, Brain, TrendingUp, Calendar, Activity } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useHealthData } from '../contexts/HealthDataContext';
import { useLanguage } from '../contexts/LanguageContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { healthData, getStats } = useHealthData();
  const { t, language } = useLanguage();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const statsData = getStats();
    setStats(statsData);
    
    if (healthData.length > 0) {
      prepareChartData();
    }
  }, [healthData]);

  const prepareChartData = () => {
    const last7Days = healthData.slice(0, 7).reverse();
    
    const data = {
      labels: last7Days.map(item => 
        new Date(item.timestamp).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { 
          month: 'short', 
          day: 'numeric' 
        })
      ),
      datasets: [
        {
          label: t('dashboard.bloodSugar'),
          data: last7Days.map(item => item.sugar),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: t('dashboard.bloodPressure'),
          data: last7Days.map(item => item.systolic),
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          fill: true,
          tension: 0.4
        }
      ]
    };
    
    setChartData(data);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        rtl: language === 'ar',
        labels: {
          font: {
            family: language === 'ar' ? 'Tajawal, sans-serif' : 'Inter, sans-serif'
          }
        }
      },
      title: {
        display: true,
        text: t('dashboard.healthTrends'),
        font: {
          size: 16,
          family: language === 'ar' ? 'Tajawal, sans-serif' : 'Inter, sans-serif'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          font: {
            family: language === 'ar' ? 'Tajawal, sans-serif' : 'Inter, sans-serif'
          }
        }
      },
      y: {
        ticks: {
          font: {
            family: language === 'ar' ? 'Tajawal, sans-serif' : 'Inter, sans-serif'
          }
        }
      }
    }
  };

  const getStatusColor = (value, type) => {
    if (type === 'sugar') {
      if (value < 70) return '#d32f2f';
      if (value < 100) return '#4caf50';
      if (value < 126) return '#ff9800';
      return '#d32f2f';
    }
    return '#4caf50';
  };

  if (!stats) {
    return (
      <div className="dashboard">
        <div className="card">
          <h2><Activity /> {t('dashboard.title')}</h2>
          <p className="text-center py-8">{t('dashboard.noData')} {t('dashboard.startMessage')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-grid">
        <div className="kpi-card">
          <div className="kpi-icon">
            <Droplets />
          </div>
          <h3>{t('dashboard.bloodSugar')}</h3>
          <div 
            className="value" 
            style={{ color: getStatusColor(stats.latest.sugar, 'sugar') }}
          >
            {stats.latest.sugar}
          </div>
          <span className="unit">{t('common.mgDL')}</span>
          <div className="kpi-trend">
            <small>{t('dashboard.average')}: {stats.averages.sugar}</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <HeartPulse />
          </div>
          <h3>{t('dashboard.bloodPressure')}</h3>
          <div 
            className="value" 
            style={{ color: getStatusColor(stats.latest.systolic, 'pressure') }}
          >
            {stats.latest.systolic}/{stats.latest.diastolic}
          </div>
          <span className="unit">{t('common.mmHg')}</span>
          <div className="kpi-trend">
            <small>{t('dashboard.average')}: {stats.averages.systolic}/{stats.averages.diastolic}</small>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <Scale />
          </div>
          <h3>{t('dashboard.weight')}</h3>
          <div className="value good">
            {stats.latest.weight || '--'}
          </div>
          <span className="unit">{t('common.kg')}</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon">
            <Brain />
          </div>
          <h3>{t('dashboard.totalReadings')}</h3>
          <div className="value info">
            {stats.totalReadings}
          </div>
          <span className="unit">{t('common.readings')}</span>
          <div className="kpi-trend">
            <small>{t('dashboard.lastUpdate')}</small>
          </div>
        </div>
      </div>

      <div className="card">
        <h2><TrendingUp /> {t('dashboard.healthTrends')}</h2>
        <div className="chart-container" style={{ height: '400px' }}>
          {chartData ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <p className="text-center py-16">{t('dashboard.noData')}</p>
          )}
        </div>
      </div>

      <div className="card">
        <h2><Calendar /> {t('dashboard.recentReadings')}</h2>
        <div className="recent-readings">
          <table>
            <thead>
              <tr>
                <th>{t('dashboard.date')}</th>
                <th>{t('dashboard.bloodSugar')}</th>
                <th>{t('dashboard.bloodPressure')}</th>
                <th>{t('dashboard.weight')}</th>
                <th>{t('dashboard.symptoms')}</th>
              </tr>
            </thead>
            <tbody>
              {healthData.slice(0, 5).map((item) => (
                <tr key={item.id}>
                  <td>{new Date(item.timestamp).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</td>
                  <td>
                    <span style={{ color: getStatusColor(item.sugar, 'sugar') }}>
                      {item.sugar}
                    </span>
                  </td>
                  <td>{item.systolic}/{item.diastolic}</td>
                  <td>{item.weight || '--'}</td>
                  <td>{item.symptoms || t('dashboard.none')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;