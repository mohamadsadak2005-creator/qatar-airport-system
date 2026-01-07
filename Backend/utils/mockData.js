/**
 * بيانات تجريبية - Mock Data
 * استخدم هذه البيانات لاختبار API endpoints
 */

// مستخدم تجريبي
export const mockUser = {
  email: 'user@example.com',
  password: 'password123',
  fullName: 'أحمد علي',
  phoneNumber: '+966501234567',
  dateOfBirth: '1990-01-15',
  gender: 'male',
  avatar: 'https://api.example.com/avatars/user1.jpg'
};

// سجل طبي تجريبي
export const mockMedicalRecord = {
  bloodPressure: {
    systolic: 140,
    diastolic: 90,
    timestamp: new Date()
  },
  bloodSugar: {
    value: 150,
    time: 'after_meal',
    timestamp: new Date()
  },
  symptoms: ['صداع', 'إرهاق', 'دوار'],
  notes: 'الحالة سيئة قليلاً اليوم',
  doctorNotes: 'يجب متابعة القراءات',
  medications: ['دواء أ', 'دواء ب']
};

// قراءة ضغط دم تجريبية
export const mockBloodPressure = {
  systolic: 120,
  diastolic: 80,
  notes: 'صباحاً',
  position: 'sitting',
  mood: 'calm',
  timestamp: new Date()
};

// قراءة سكر تجريبية
export const mockBloodSugar = {
  value: 110,
  time: 'before_meal',
  notes: 'قبل الإفطار',
  mealTime: false,
  timestamp: new Date()
};

// تحليل ذكاء اصطناعي تجريبي
export const mockAIAnalysis = {
  bloodPressure: {
    systolic: 140,
    diastolic: 90
  },
  bloodSugar: {
    value: 150
  },
  symptoms: ['صداع', 'إرهاق'],
  medicalHistory: {
    hypertension: true,
    diabetes: true,
    cholesterol: false
  }
};

// بيانات التحليلات
export const mockAnalytics = {
  period: 'monthly',
  startDate: '2025-11-05',
  endDate: '2025-12-05',
  metrics: {
    totalReadings: 45,
    averageBP: {
      systolic: 125,
      diastolic: 82
    },
    averageBloodSugar: 115,
    normalReadings: 30,
    abnormalReadings: 15
  }
};

// بيانات التقرير
export const mockReport = {
  month: 12,
  year: 2025,
  user: {
    id: '123',
    name: 'أحمد علي',
    email: 'user@example.com'
  },
  summary: {
    totalRecords: 45,
    averageBloodPressure: '125/82',
    averageBloodSugar: 115,
    trend: 'stable'
  },
  recommendations: [
    'استمر في متابعة القراءات يومياً',
    'حاول تقليل الملح في الطعام',
    'مارس الرياضة لمدة 30 دقيقة يومياً',
    'قلل من التوتر والقلق'
  ],
  warnings: [
    'لديك 5 قراءات ضغط دم عالية',
    'لديك 3 قراءات سكر مرتفعة'
  ]
};

// بيانات الإشعارات
export const mockAlerts = [
  {
    id: 1,
    type: 'high_blood_pressure',
    title: 'ضغط الدم مرتفع',
    message: 'قراءة الضغط 150/95 - أعلى من الطبيعي',
    severity: 'warning',
    timestamp: new Date(),
    read: false
  },
  {
    id: 2,
    type: 'high_blood_sugar',
    title: 'السكر مرتفع',
    message: 'قراءة السكر 180 - أعلى من الطبيعي',
    severity: 'warning',
    timestamp: new Date(),
    read: false
  },
  {
    id: 3,
    type: 'low_blood_pressure',
    title: 'ضغط الدم منخفض',
    message: 'قراءة الضغط 100/60 - قد يكون هناك خلل',
    severity: 'info',
    timestamp: new Date(),
    read: true
  }
];

// بيانات المستخدمين
export const mockUsers = [
  {
    id: 1,
    email: 'user1@example.com',
    fullName: 'أحمد علي',
    role: 'user',
    createdAt: '2025-01-01'
  },
  {
    id: 2,
    email: 'user2@example.com',
    fullName: 'فاطمة محمد',
    role: 'user',
    createdAt: '2025-02-01'
  },
  {
    id: 3,
    email: 'admin@example.com',
    fullName: 'الإدارة',
    role: 'admin',
    createdAt: '2024-12-01'
  }
];

// بيانات الرسوم البيانية
export const mockCharts = {
  bloodPressureChart: {
    type: 'line',
    title: 'ضغط الدم',
    xAxis: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
    datasets: [
      {
        label: 'الضغط الانقباضي',
        data: [120, 125, 130, 128, 125, 122, 120]
      },
      {
        label: 'الضغط الانبساطي',
        data: [80, 82, 85, 83, 82, 80, 80]
      }
    ]
  },
  bloodSugarChart: {
    type: 'line',
    title: 'السكر',
    xAxis: ['السبت', 'الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'],
    datasets: [
      {
        label: 'السكر',
        data: [110, 115, 120, 118, 112, 110, 108]
      }
    ]
  }
};

// الإحصائيات
export const mockStats = {
  user: {
    totalRecords: 135,
    averageBP: '122/81',
    averageBS: 115,
    lastRecordDate: '2025-12-05',
    recordsThisMonth: 15,
    recordsThisWeek: 5
  },
  system: {
    totalUsers: 150,
    totalRecords: 5000,
    totalAlerts: 200,
    activeUsers: 45,
    uptime: '99.8%'
  }
};

// خيارات البحث
export const mockSearchQueries = [
  { query: 'صداع', type: 'symptom' },
  { query: 'ضغط دم', type: 'metric' },
  { query: 'أحمد', type: 'user' },
  { query: 'عالي', type: 'severity' }
];

export default {
  mockUser,
  mockMedicalRecord,
  mockBloodPressure,
  mockBloodSugar,
  mockAIAnalysis,
  mockAnalytics,
  mockReport,
  mockAlerts,
  mockUsers,
  mockCharts,
  mockStats,
  mockSearchQueries
};
