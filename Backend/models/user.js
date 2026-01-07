/**
 * نموذج المستخدم - TypeORM
 */

import { EntitySchema } from 'typeorm';

export const User = new EntitySchema({
  name: 'users',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
    },
    username: {
      type: 'varchar',
      length: 30,
      unique: true,
      nullable: false,
    },
    email: {
      type: 'varchar',
      length: 255,
      unique: true,
      nullable: false,
    },
    password: {
      type: 'varchar',
      length: 255,
      nullable: false,
    },
    fullName: {
      type: 'varchar',
      length: 255,
      nullable: true,
    },
    age: {
      type: 'int',
      nullable: true,
    },
    gender: {
      type: 'enum',
      enum: ['male', 'female', 'other'],
      nullable: true,
    },
    height: {
      type: 'float',
      nullable: true,
    },
    weight: {
      type: 'float',
      nullable: true,
    },
    chronicDiseases: {
      type: 'text',
      nullable: true,
    },
    medications: {
      type: 'text',
      nullable: true,
    },
    allergies: {
      type: 'text',
      nullable: true,
    },
    language: {
      type: 'varchar',
      default: 'ar',
      length: 10,
    },
    subscriptionType: {
      type: 'enum',
      enum: ['free', 'premium', 'professional'],
      default: 'free',
    },
    subscriptionExpiresAt: {
      type: 'timestamp',
      nullable: true,
    },
    isActive: {
      type: 'boolean',
      default: true,
    },
    isEmailVerified: {
      type: 'boolean',
      default: false,
    },
    lastLogin: {
      type: 'timestamp',
      nullable: true,
    },
    loginCount: {
      type: 'int',
      default: 0,
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
    { columns: ['email'], unique: true },
    { columns: ['username'], unique: true },
    { columns: ['createdAt'] },
  ],
});

export default User;