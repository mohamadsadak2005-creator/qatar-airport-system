/**
 * نموذج السجل الصحي الشامل - TypeORM
 */

import { EntitySchema } from 'typeorm';

export const HealthRecord = new EntitySchema({
  name: 'health_records',
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
    recordedAt: {
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      nullable: false,
    },
    // السكر
    sugarValue: {
      type: 'float',
      nullable: true,
    },
    sugarType: {
      type: 'varchar',
      length: 50,
      nullable: true,
    },
    sugarUnit: {
      type: 'varchar',
      length: 20,
      default: 'mg/dL',
    },
    // ضغط الدم
    systolic: {
      type: 'int',
      nullable: true,
    },
    diastolic: {
      type: 'int',
      nullable: true,
    },
    pulse: {
      type: 'int',
      nullable: true,
    },
    // القياسات الجسدية
    weight: {
      type: 'float',
      nullable: true,
    },
    height: {
      type: 'float',
      nullable: true,
    },
    bmi: {
      type: 'float',
      nullable: true,
    },
    // التحليل
    riskLevel: {
      type: 'enum',
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low',
    },
    status: {
      type: 'varchar',
      length: 50,
      nullable: true,
    },
    notes: {
      type: 'text',
      nullable: true,
    },
    aiAnalysis: {
      type: 'text',
      nullable: true,
    },
    recommendations: {
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
    { columns: ['recordedAt'] },
    { columns: ['userId', 'recordedAt'] },
    { columns: ['riskLevel'] },
  ],
  relations: {
    user: {
      type: 'many-to-one',
      target: 'users',
      joinColumn: { name: 'userId', referencedColumnName: 'id' },
    },
  },
});

// NOTE: Mongoose-specific schema methods/indexes were removed.
// Reimplement any complex helpers using TypeORM repository queries in services.

export default HealthRecord;