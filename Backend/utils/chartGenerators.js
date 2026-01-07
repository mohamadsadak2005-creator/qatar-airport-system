/**
 * أدوات متقدمة لتوليد الرسوم البيانية
 */

import fs from 'fs';
import path from 'path';
import logger from './logger.js';
import Helpers from './helpers.js';

class ChartGenerators {
  constructor() {
    this.defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          rtl: true
        },
        title: {
          display: true,
          font: {
            size: 16
          }
        }
      }
    };
  }

  /**
   * @desc    إنشاء رسم بياني كصورة
   * @param   {Object} chartConfig - إعدادات الرسم البياني
   * @param   {Object} options - خيارات إضافية
   * @returns {Promise<Object>} - نتيجة التوليد
   */
  async generateChartImage(chartConfig, options = {}) {
    try {
      const {
        width = 800,
        height = 400,
        format = 'png',
        quality = 0.8,
        outputPath = null
      } = options;

      // إنشاء canvas
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // دمج الإعدادات الافتراضية مع الإعدادات المخصصة
      const mergedOptions = this.mergeOptions(this.defaultOptions, chartConfig.options || {});

      // إنشاء الرسم البياني
      const chart = new ChartJS(ctx, {
        type: chartConfig.type,
        data: chartConfig.data,
        options: {
          ...mergedOptions,
          animation: false,
          responsive: false
        }
      });

      // انتظر حتى يتم render الرسم البياني
      await new Promise(resolve => setTimeout(resolve, 500));

      // توليد الصورة
      const buffer = canvas.toBuffer(`image/${format}`, { quality });
      
      // حفظ الصورة إذا طلب
      let imageUrl = null;
      if (outputPath) {
        const fileName = `chart-${Date.now()}.${format}`;
        const filePath = path.join(outputPath, fileName);
        
        // التأكد من وجود المجلد
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filePath, buffer);
        imageUrl = `/charts/${fileName}`;
      }

      // تدمير الرسم البياني لتحرير الذاكرة
      chart.destroy();

      logger.chart('generate', chartConfig.type, {
        width,
        height,
        format,
        imageUrl
      });

      return {
        success: true,
        buffer,
        imageUrl,
        format,
        size: buffer.length
      };

    } catch (error) {
      logger.error('Chart image generation failed', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * @desc    إنشاء رسم بياني تفاعلي (HTML)
   * @param   {Object} chartConfig - إعدادات الرسم البياني
   * @param   {string} canvasId - معرف canvas
   * @returns {string} - كود HTML مع JavaScript
   */
  generateInteractiveChart(chartConfig, canvasId = 'chartCanvas') {
    const { type, data, options } = chartConfig;
    
    const mergedOptions = this.mergeOptions(this.defaultOptions, options || {});
    
    const html = `
      <div class="chart-container">
        <canvas id="${canvasId}"></canvas>
      </div>
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const ctx = document.getElementById('${canvasId}').getContext('2d');
          new Chart(ctx, {
            type: '${type}',
            data: ${JSON.stringify(data)},
            options: ${JSON.stringify(mergedOptions)}
          });
        });
      </script>
    `;

    return html;
  }

  /**
   * @desc    إنشاء لوحة تحكم متعددة الرسوم
   * @param   {Array} charts - مصفوفة الرسوم البيانية
   * @param   {Object} layout - تخطيط اللوحة
   * @returns {string} - كود HTML للوحة التحكم
   */
  generateDashboard(charts, layout = { columns: 2, responsive: true }) {
    const { columns = 2, responsive = true } = layout;
    
    let html = `<div class="dashboard ${responsive ? 'dashboard-responsive' : ''}">`;
    
    charts.forEach((chartConfig, index) => {
      const canvasId = `chart-${index}`;
      const chartHtml = this.generateInteractiveChart(chartConfig, canvasId);
      
      html += `
        <div class="dashboard-item" style="flex: 1 1 calc(${100 / columns}% - 20px);">
          <div class="chart-card">
            <div class="chart-header">
              <h3>${chartConfig.options?.plugins?.title?.text || `رسم بياني ${index + 1}`}</h3>
            </div>
            ${chartHtml}
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    
    // إضافة CSS للوحة التحكم
    const css = `
      <style>
        .dashboard {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin: 20px 0;
        }
        .dashboard-responsive {
          flex-direction: row;
        }
        @media (max-width: 768px) {
          .dashboard-responsive {
            flex-direction: column;
          }
          .dashboard-item {
            flex: 1 1 100% !important;
          }
        }
        .dashboard-item {
          margin-bottom: 20px;
        }
        .chart-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .chart-header h3 {
          margin: 0 0 15px 0;
          color: #333;
          text-align: right;
        }
        .chart-container {
          position: relative;
          height: 300px;
        }
      </style>
    `;
    
    return css + html;
  }

  /**
   * @desc    إنشاء رسم بياني إحصائي
   * @param   {Array} data - البيانات
   * @param   {string} chartType - نوع الرسم
   * @param   {Object} options - خيارات إضافية
   * @returns {Object} - إعدادات الرسم البياني
   */
  createStatisticalChart(data, chartType = 'bar', options = {}) {
    const stats = Helpers.calculateBasicStats(data);
    
    const chartData = {
      labels: ['المتوسط', 'الوسيط', 'الحد الأدنى', 'الحد الأقصى', 'المجموع'],
      datasets: [{
        label: 'الإحصائيات',
        data: [stats.mean, stats.median, stats.min, stats.max, stats.sum],
        backgroundColor: Helpers.generateChartColors(5, 0.7),
        borderColor: Helpers.generateChartColors(5, 1),
        borderWidth: 2
      }]
    };

    return {
      type: chartType,
      data: chartData,
      options: {
        ...this.defaultOptions,
        plugins: {
          ...this.defaultOptions.plugins,
          title: {
            ...this.defaultOptions.plugins.title,
            text: options.title || 'الرسم البياني الإحصائي'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y}`;
              }
            }
          }
        }
      }
    };
  }

  /**
   * @desc    إنشاء رسم بياني مقارن
   * @param   {Object} dataSets - مجموعات البيانات للمقارنة
   * @param   {string} chartType - نوع الرسم
   * @param   {Object} options - خيارات إضافية
   * @returns {Object} - إعدادات الرسم البياني
   */
  createComparisonChart(dataSets, chartType = 'bar', options = {}) {
    const labels = Object.keys(dataSets);
    const datasets = [];

    let colorIndex = 0;
    for (const [label, data] of Object.entries(dataSets)) {
      datasets.push({
        label: label,
        data: Array.isArray(data) ? data : Object.values(data),
        backgroundColor: Helpers.generateChartColors(Object.keys(dataSets).length, 0.7)[colorIndex],
        borderColor: Helpers.generateChartColors(Object.keys(dataSets).length, 1)[colorIndex],
        borderWidth: 2
      });
      colorIndex++;
    }

    const chartLabels = Array.isArray(dataSets[labels[0]]) ? 
      dataSets[labels[0]].map((_, i) => `عنصر ${i + 1}`) : 
      Object.keys(dataSets[labels[0]]);

    return {
      type: chartType,
      data: {
        labels: chartLabels,
        datasets: datasets
      },
      options: {
        ...this.defaultOptions,
        plugins: {
          ...this.defaultOptions.plugins,
          title: {
            ...this.defaultOptions.plugins.title,
            text: options.title || 'الرسم البياني المقارن'
          }
        },
        scales: chartType === 'bar' ? {
          x: {
            stacked: options.stacked || false
          },
          y: {
            stacked: options.stacked || false,
            beginAtZero: true
          }
        } : undefined
      }
    };
  }

  /**
   * @desc    إنشاء رسم بياني زمني
   * @param   {Object} timeSeriesData - البيانات الزمنية
   * @param   {string} chartType - نوع الرسم
   * @param   {Object} options - خيارات إضافية
   * @returns {Object} - إعدادات الرسم البياني
   */
  createTimeSeriesChart(timeSeriesData, chartType = 'line', options = {}) {
    const datasets = [];
    let colorIndex = 0;

    for (const [label, data] of Object.entries(timeSeriesData)) {
      const timeData = Array.isArray(data) ? data : Object.entries(data).map(([time, value]) => ({
        x: new Date(time),
        y: value
      }));

      datasets.push({
        label: label,
        data: timeData,
        borderColor: Helpers.generateChartColors(Object.keys(timeSeriesData).length, 1)[colorIndex],
        backgroundColor: Helpers.generateChartColors(Object.keys(timeSeriesData).length, 0.1)[colorIndex],
        borderWidth: 3,
        fill: options.fill || true,
        tension: options.tension || 0.4
      });
      colorIndex++;
    }

    return {
      type: chartType,
      data: {
        datasets: datasets
      },
      options: {
        ...this.defaultOptions,
        plugins: {
          ...this.defaultOptions.plugins,
          title: {
            ...this.defaultOptions.plugins.title,
            text: options.title || 'الرسم البياني الزمني'
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: options.timeUnit || 'day'
            },
            title: {
              display: true,
              text: 'الوقت'
            }
          },
          y: {
            title: {
              display: true,
              text: 'القيمة'
            }
          }
        }
      }
    };
  }

  /**
   * @desc    إنشاء رسم بياني تقدمي (Progress)
   * @param   {Object} progressData - بيانات التقدم
   * @param   {Object} options - خيارات إضافية
   * @returns {Object} - إعدادات الرسم البياني
   */
  createProgressChart(progressData, options = {}) {
    const labels = Object.keys(progressData);
    const values = Object.values(progressData);
    const percentages = values.map(value => (value / Math.max(...values)) * 100);

    return {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'النسبة المئوية',
          data: percentages,
          backgroundColor: Helpers.generateChartColors(labels.length, 0.7),
          borderColor: Helpers.generateChartColors(labels.length, 1),
          borderWidth: 2
        }]
      },
      options: {
        ...this.defaultOptions,
        indexAxis: 'y',
        plugins: {
          ...this.defaultOptions.plugins,
          title: {
            ...this.defaultOptions.plugins.title,
            text: options.title || 'رسم بياني تقدمي'
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = values[context.dataIndex];
                const percentage = percentages[context.dataIndex].toFixed(1);
                return `${context.dataset.label}: ${percentage}% (${value})`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'النسبة المئوية %'
            }
          }
        }
      }
    };
  }

  /**
   * @desc    إنشاء رسم بياني مخصص من قالب
   * @param   {string} templateName - اسم القالب
   * @param   {Object} data - البيانات
   * @param   {Object} customizations - التخصيصات
   * @returns {Object} - إعدادات الرسم البياني
   */
  createChartFromTemplate(templateName, data, customizations = {}) {
    const templates = {
      'sales-report': {
        type: 'line',
        options: {
          plugins: {
            title: {
              text: 'تقرير المبيعات'
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      },
      'user-activity': {
        type: 'bar',
        options: {
          plugins: {
            title: {
              text: 'نشاط المستخدمين'
            }
          }
        }
      },
      'performance-metrics': {
        type: 'radar',
        options: {
          plugins: {
            title: {
              text: 'مقاييس الأداء'
            }
          }
        }
      }
    };

    const template = templates[templateName] || templates['sales-report'];
    
    const chartConfig = {
      type: template.type,
      data: Helpers.prepareDataForChart(data, template.type),
      options: this.mergeOptions(template.options, customizations)
    };

    return chartConfig;
  }

  /**
   * @desc    دمج إعدادات الرسم البياني
   * @param   {Object} defaultOptions - الإعدادات الافتراضية
   * @param   {Object} customOptions - الإعدادات المخصصة
   * @returns {Object} - الإعدادات المدمجة
   */
  mergeOptions(defaultOptions, customOptions) {
    const merged = JSON.parse(JSON.stringify(defaultOptions));
    
    const deepMerge = (target, source) => {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (!target[key]) target[key] = {};
          deepMerge(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    };

    deepMerge(merged, customOptions);
    return merged;
  }

  /**
   * @desc    تصدير الرسم البياني بتنسيقات مختلفة
   * @param   {Object} chartConfig - إعدادات الرسم البياني
   * @param   {string} format - التنسيق (png, jpeg, svg, pdf)
   * @param   {Object} options - خيارات إضافية
   * @returns {Promise<Object>} - نتيجة التصدير
   */
  async exportChart(chartConfig, format = 'png', options = {}) {
    try {
      switch (format.toLowerCase()) {
        case 'png':
        case 'jpeg':
        case 'jpg':
          return await this.generateChartImage(chartConfig, {
            format: format === 'jpg' ? 'jpeg' : format,
            ...options
          });
        
        case 'svg':
          return await this.exportAsSVG(chartConfig, options);
        
        case 'pdf':
          return await this.exportAsPDF(chartConfig, options);
        
        case 'html':
          return {
            success: true,
            data: this.generateInteractiveChart(chartConfig, options.canvasId),
            format: 'html'
          };
        
        case 'json':
          return {
            success: true,
            data: chartConfig,
            format: 'json'
          };
        
        default:
          throw new Error(`التنسيق غير مدعوم: ${format}`);
      }
    } catch (error) {
      logger.error('Chart export failed', { format, error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * @desc    تصدير الرسم البياني كـ SVG
   */
  async exportAsSVG(chartConfig, options = {}) {
    // في تطبيق حقيقي، ستستخدم مكتبة متخصصة لتحويل Canvas إلى SVG
    // هذا مثال مبسط للتوثيق
    const svgContent = `
      <svg width="${options.width || 800}" height="${options.height || 400}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="white"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-size="16">
          رسم بياني ${chartConfig.type} - SVG Export
        </text>
      </svg>
    `;

    return {
      success: true,
      data: svgContent,
      format: 'svg'
    };
  }

  /**
   * @desc    تصدير الرسم البياني كـ PDF
   */
  async exportAsPDF(chartConfig, options = {}) {
    // في تطبيق حقيقي، ستستخدم مكتبة مثل pdfkit أو jspdf
    // هذا مثال مبسط للتوثيق
    const pdfContent = `PDF Export for ${chartConfig.type} chart`;

    return {
      success: true,
      data: pdfContent,
      format: 'pdf'
    };
  }

  /**
   * @desc    إنشاء تقرير متعدد الصفحات
   * @param   {Array} charts - مصفوفة الرسوم البيانية
   * @param   {Object} reportOptions - خيارات التقرير
   * @returns {Promise<Object>} - التقرير النهائي
   */
  async generateReport(charts, reportOptions = {}) {
    try {
      const { title = 'تقرير الرسوم البيانية', author = 'النظام' } = reportOptions;
      
      const report = {
        title,
        author,
        generatedAt: new Date().toISOString(),
        charts: [],
        summary: {
          totalCharts: charts.length,
          chartTypes: {}
        }
      };

      // معالجة كل رسم بياني
      for (const chartConfig of charts) {
        const chartResult = await this.generateChartImage(chartConfig, {
          outputPath: reportOptions.outputPath
        });

        if (chartResult.success) {
          report.charts.push({
            type: chartConfig.type,
            title: chartConfig.options?.plugins?.title?.text || 'رسم بياني',
            imageUrl: chartResult.imageUrl,
            config: chartConfig
          });

          // تحديث الإحصائيات
          report.summary.chartTypes[chartConfig.type] = 
            (report.summary.chartTypes[chartConfig.type] || 0) + 1;
        }
      }

      logger.chart('report_generated', 'multi', {
        totalCharts: report.summary.totalCharts,
        chartTypes: report.summary.chartTypes
      });

      return {
        success: true,
        report
      };

    } catch (error) {
      logger.error('Report generation failed', { error: error.message });
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// إنشاء instance من مولد الرسوم البيانية
const chartGenerators = new ChartGenerators();

export default chartGenerators;

// إنشاء رسم بياني
const chartConfig = chartGenerators.createStatisticalChart([10, 20, 30, 40, 50], 'bar');
const chartResult = await chartGenerators.generateChartImage(chartConfig);