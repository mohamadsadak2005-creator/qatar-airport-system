import React, { useState, useEffect, useMemo } from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Download, Filter, RefreshCw, BarChart3 } from 'lucide-react';
import { useHealthData } from '../contexts/HealthDataContext';
import { useLanguage } from '../contexts/LanguageContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Charts = () => {
  const { healthData } = useHealthData();
  const { t, language } = useLanguage();
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('week');
  const [chartData, setChartData] = useState(null);

  // تعريف دالة getChartTitle أولاً
  const getChartTitle = () => {
    const typeNames = {
      'line': t('charts.line'),
      'bar': t('charts.bar'),
      'pie': t('charts.pie'),
      'doughnut': t('charts.doughnut')
    };

    const rangeNames = {
      'week': t('charts.week'),
      'month': t('charts.month'),
      'all': t('charts.all')
    };

    return `${t('charts.title')} - ${typeNames[chartType]} (${rangeNames[timeRange]})`;
  };

  // تعريف chartOptions باستخدام useMemo
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        rtl: language === 'ar',
        labels: {
          font: {
            family: language === 'ar' ? 'Tajawal, sans-serif' : 'Inter, sans-serif',
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: getChartTitle(),
        font: {
          size: 18,
          family: language === 'ar' ? 'Tajawal, sans-serif' : 'Inter, sans-serif',
          weight: 'bold'
        }
      },
      tooltip: {
        rtl: language === 'ar',
        titleFont: {
          family: language === 'ar' ? 'Tajawal, sans-serif' : 'Inter, sans-serif'
        },
        bodyFont: {
          family: language === 'ar' ? 'Tajawal, sans-serif' : 'Inter, sans-serif'
        }
      }
    },
    scales: chartType === 'pie' || chartType === 'doughnut' ? {} : {
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
  }), [chartType, timeRange, t, language]);

  const prepareChartData = () => {
    let filteredData = [...healthData];
    
    // Filter by time range
    const now = new Date();
    if (timeRange === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredData = filteredData.filter(d => new Date(d.timestamp) > weekAgo);
    } else if (timeRange === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredData = filteredData.filter(d => new Date(d.timestamp) > monthAgo);
    }

    if (filteredData.length === 0) {
      setChartData(null);
      return;
    }

    // Reverse to show oldest first
    filteredData = filteredData.reverse();

    const labels = filteredData.map(d => 
      new Date(d.timestamp).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric'
      })
    );

    const sugarData = filteredData.map(d => d.sugar);
    const systolicData = filteredData.map(d => d.systolic);
    const diastolicData = filteredData.map(d => d.diastolic);

    const baseData = {
      labels,
      datasets: []
    };

    if (chartType === 'pie' || chartType === 'doughnut') {
      // For pie/doughnut charts, show distribution of readings
      const categories = {
        [t('status.normal')]: 0,
        [t('status.high')]: 0,
        [t('status.low')]: 0
      };

      filteredData.forEach(item => {
        if (item.sugar < 70) categories[t('status.low')]++;
        else if (item.sugar > 126) categories[t('status.high')]++;
        else categories[t('status.normal')]++;
      });

      baseData.labels = Object.keys(categories);
      baseData.datasets = [{
        data: Object.values(categories),
        backgroundColor: [
          'rgba(76, 175, 80, 0.7)',
          'rgba(255, 152, 0, 0.7)',
          'rgba(211, 47, 47, 0.7)'
        ],
        borderColor: [
          'rgb(76, 175, 80)',
          'rgb(255, 152, 0)',
          'rgb(211, 47, 47)'
        ],
        borderWidth: 2
      }];
    } else {
      // For line/bar charts
      baseData.datasets = [
        {
          label: t('dashboard.bloodSugar'),
          data: sugarData,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: chartType === 'line',
          tension: 0.4
        },
        {
          label: t('dashboard.bloodPressure'),
          data: systolicData,
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderWidth: 3,
          fill: chartType === 'line',
          tension: 0.4
        },
        {
          label: language === 'ar' ? 'الضغط الانبساطي' : 'Diastolic Pressure',
          data: diastolicData,
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          fill: chartType === 'line',
          tension: 0.4
        }
      ];
    }

    setChartData(baseData);
  };

  useEffect(() => {
    prepareChartData();
  }, [healthData, timeRange, chartType, language, t]);

  const renderChart = () => {
    if (!chartData) {
      return (
        <div className="no-data">
          <BarChart3 size={64} />
          <h3>{t('charts.noData')}</h3>
          <p>{t('charts.startMessage')}</p>
        </div>
      );
    }

    switch (chartType) {
      case 'line':
        return <Line data={chartData} options={chartOptions} />;
      case 'bar':
        return <Bar data={chartData} options={chartOptions} />;
      case 'pie':
        return <Pie data={chartData} options={chartOptions} />;
      case 'doughnut':
        return <Doughnut data={chartData} options={chartOptions} />;
      default:
        return <Line data={chartData} options={chartOptions} />;
    }
  };

  const exportChart = () => {
    const link = document.createElement('a');
    const canvas = document.querySelector('canvas');
    if (canvas) {
      link.download = `health-chart-${new Date().getTime()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const generateReport = () => {
    const report = language === 'ar' ? `
تقرير الصحة الذكي
التاريخ: ${new Date().toLocaleDateString('ar-SA')}
----------------------------

إجمالي القراءات: ${healthData.length}
آخر قراءة: ${healthData[0] ? new Date(healthData[0].timestamp).toLocaleDateString('ar-SA') : 'لا توجد'}

ملخص:
${healthData.slice(0, 5).map((item, i) => `
${i + 1}. ${new Date(item.timestamp).toLocaleDateString('ar-SA')}
   - ${t('dashboard.bloodSugar')}: ${item.sugar} ${t('common.mgDL')}
   - ${t('dashboard.bloodPressure')}: ${item.systolic}/${item.diastolic} ${t('common.mmHg')}
   - ${t('dashboard.weight')}: ${item.weight || t('common.notSpecified')} ${t('common.kg')}
`).join('\n')}

توصيات:
• ${t('charts.exportReport')}
• ${language === 'ar' ? 'سجل جميع القراءات في النظام' : 'Record all readings in the system'}
• ${language === 'ar' ? 'اتبع النصائح المقدمة من المساعد الذكي' : 'Follow the advice provided by the AI Assistant'}
• ${language === 'ar' ? 'راجع الطبيب بانتظام' : 'Consult your doctor regularly'}
    ` : `
Smart Health Report
Date: ${new Date().toLocaleDateString('en-US')}
----------------------------

Total Readings: ${healthData.length}
Last Reading: ${healthData[0] ? new Date(healthData[0].timestamp).toLocaleDateString('en-US') : 'None'}

Summary:
${healthData.slice(0, 5).map((item, i) => `
${i + 1}. ${new Date(item.timestamp).toLocaleDateString('en-US')}
   - ${t('dashboard.bloodSugar')}: ${item.sugar} ${t('common.mgDL')}
   - ${t('dashboard.bloodPressure')}: ${item.systolic}/${item.diastolic} ${t('common.mmHg')}
   - ${t('dashboard.weight')}: ${item.weight || t('common.notSpecified')} ${t('common.kg')}
`).join('\n')}

Recommendations:
• ${t('charts.exportReport')}
• Record all readings in the system
• Follow the advice provided by the AI Assistant
• Consult your doctor regularly
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `health-report-${new Date().getTime()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="charts">
      <div className="card">
        <div className="chart-header">
          <h2><BarChart3 /> {t('charts.title')}</h2>
          
          <div className="chart-controls">
            <div className="control-group">
              <label>
                <Filter size={18} />
                {t('charts.chartType')}
              </label>
              <select 
                value={chartType} 
                onChange={(e) => setChartType(e.target.value)}
              >
                <option value="line">{t('charts.line')}</option>
                <option value="bar">{t('charts.bar')}</option>
                <option value="pie">{t('charts.pie')}</option>
                <option value="doughnut">{t('charts.doughnut')}</option>
              </select>
            </div>

            <div className="control-group">
              <label>
                <RefreshCw size={18} />
                {t('charts.timeRange')}
              </label>
              <select 
                value={timeRange} 
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="week">{t('charts.week')}</option>
                <option value="month">{t('charts.month')}</option>
                <option value="all">{t('charts.all')}</option>
              </select>
            </div>

            <button className="export-btn" onClick={exportChart}>
              <Download size={18} />
              {t('charts.exportImage')}
            </button>

            <button className="export-btn secondary" onClick={generateReport}>
              <Download size={18} />
              {t('charts.exportReport')}
            </button>
          </div>
        </div>

        <div className="chart-display" style={{ height: '500px' }}>
          {renderChart()}
        </div>

        <div className="chart-info">
          <div className="info-item">
            <span>{t('charts.displayedReadings')}:</span>
            <strong>{chartData ? chartData.labels.length : 0}</strong>
          </div>
          <div className="info-item">
            <span>{t('charts.chartTypeLabel')}:</span>
            <strong>
              {chartType === 'line' ? t('charts.line') : 
               chartType === 'bar' ? t('charts.bar') : 
               chartType === 'pie' ? t('charts.pie') : t('charts.doughnut')}
            </strong>
          </div>
          <div className="info-item">
            <span>{t('charts.lastUpdated')}:</span>
            <strong>{new Date().toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;