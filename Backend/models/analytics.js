/**
 * نموذج التحليلات - TypeORM
 */

import { EntitySchema } from 'typeorm';

export const Analytics = new EntitySchema({
  name: 'analytics',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    userId: {
      type: 'uuid',
      nullable: false,
    },
    date: {
      type: 'date',
      nullable: false,
    },
    // إحصائيات السكر
    avgSugar: {
      type: 'float',
      nullable: true,
    },
    minSugar: {
      type: 'float',
      nullable: true,
    },
    maxSugar: {
      type: 'float',
      nullable: true,
    },
    sugarReadingsCount: {
      type: 'int',
      default: 0,
    },
    // إحصائيات الضغط
    avgSystolic: {
      type: 'float',
      nullable: true,
    },
    avgDiastolic: {
      type: 'float',
      nullable: true,
    },
    avgPulse: {
      type: 'float',
      nullable: true,
    },
    pressureReadingsCount: {
      type: 'int',
      default: 0,
    },
    // الاتجاهات
    sugarTrend: {
      type: 'varchar',
      length: 20,
      nullable: true,
    },
    pressureTrend: {
      type: 'varchar',
      length: 20,
      nullable: true,
    },
    // التوصيات
    recommendations: {
      type: 'text',
      nullable: true,
    },
    // الملخص
    summary: {
      type: 'text',
      nullable: true,
    },
    createdAt: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
    },
    updatedAt: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      onUpdate: 'CURRENT_TIMESTAMP',
    },
  },
  indices: [
    { columns: ['userId'] },
    { columns: ['date'] },
    { columns: ['userId', 'date'] },
  ],
  relations: {
    user: {
      type: 'many-to-one',
      target: 'users',
      joinColumn: { name: 'userId', referencedColumnName: 'id' },
    },
  },
});

export default Analytics;