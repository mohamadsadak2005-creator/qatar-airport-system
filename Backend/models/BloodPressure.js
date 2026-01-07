/**
 * نموذج قراءات ضغط الدم - TypeORM
 */

import { EntitySchema } from 'typeorm';

// نموذج قراءات ضغط الدم - TypeORM
export const BloodPressure = new EntitySchema({
  name: 'blood_pressures',
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
    systolic: {
      type: 'int',
      nullable: false,
    },
    diastolic: {
      type: 'int',
      nullable: false,
    },
    pulse: {
      type: 'int',
      nullable: true,
    },
    position: {
      type: 'enum',
      enum: ['sitting', 'standing', 'lying'],
      default: 'sitting',
    },
    arm: {
      type: 'enum',
      enum: ['left', 'right'],
      default: 'left',
    },
    activity: {
      type: 'enum',
      enum: ['resting', 'after_exercise', 'after_eating', 'stress', 'normal'],
      default: 'normal',
    },
    notes: {
      type: 'text',
      nullable: true,
    },
    status: {
      type: 'varchar',
      length: 50,
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

// NOTE: The original Mongoose model had statics and virtuals
// (e.g., getCategoryDistribution, pulsePressure, meanArterialPressure).
// These should be reimplemented using TypeORM repository queries or
// helper functions in a service (e.g., services/alertService.js).

export default BloodPressure;