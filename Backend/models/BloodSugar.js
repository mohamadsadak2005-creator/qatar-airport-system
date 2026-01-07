/**
 * نموذج قراءات السكر في الدم - TypeORM
 */

import { EntitySchema } from 'typeorm';

export const BloodSugar = new EntitySchema({
  name: 'blood_sugars',
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
      type: 'timestamp',
      default: () => 'CURRENT_TIMESTAMP',
      nullable: false,
    },
    measurementType: {
      type: 'enum',
      enum: ['fasting', 'post_prandial', 'random', 'hba1c', 'before_meal', 'after_meal', 'bedtime'],
      nullable: false,
    },
    value: {
      type: 'float',
      nullable: false,
    },
    unit: {
      type: 'varchar',
      length: 20,
      default: 'mg/dL',
    },
    mealTime: {
      type: 'varchar',
      length: 50,
      nullable: true,
    },
    carbsCount: {
      type: 'int',
      nullable: true,
    },
    mealDescription: {
      type: 'text',
      nullable: true,
    },
    activityBefore: {
      type: 'enum',
      enum: ['none', 'light', 'moderate', 'intense'],
      nullable: true,
    },
    medicationTaken: {
      type: 'boolean',
      default: false,
    },
    medicationName: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    medicationDose: {
      type: 'float',
      nullable: true,
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
    { columns: ['measurementType'] },
  ],
  relations: {
    user: {
      type: 'many-to-one',
      target: 'users',
      joinColumn: { name: 'userId', referencedColumnName: 'id' },
    },
  },
});

// NOTE: Mongoose-specific statics/virtuals were removed. Reimplement
// any needed helpers using TypeORM repositories in a service file.

export default BloodSugar;