import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const levelEnum = z.enum(['beginner_zero', 'beginner', 'intermediate', 'advanced', 'career', 'hobby']);
const platformEnum = z.enum([
  'youtube', 'udemy', 'coloso', 'note', 'gumroad',
  'blender_market', 'booth', 'official', 'x', 'instagram',
  'web', 'addon', 'book'
]);
const priceTypeEnum = z.enum(['free', 'paid', 'freemium']);
const statusEnum = z.enum(['active', 'archived', 'pending']);
const languageEnum = z.enum(['ja', 'en']);

const contentBase = z.object({
  title: z.string(),
  url: z.string().url(),
  platform: platformEnum,
  priceType: priceTypeEnum,
  price: z.number().optional().nullable(),
  creator: z.string(),
  language: languageEnum.default('ja'),
  level: z.array(levelEnum),
  categories: z.array(z.string()),
  goals: z.array(z.string()).optional(),
  duration: z.string().optional().nullable(),
  recommendedOrder: z.number().optional().nullable(),
  summary: z.string(),
  comment: z.string().optional().nullable(),
  affiliateUrl: z.string().url().optional().nullable(),
  isAffiliate: z.boolean().default(false),
  isPr: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(),
  updatedAt: z.string().optional().nullable(),
  status: statusEnum.default('active'),
});

export const collections = {
  tutorials: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/tutorials' }),
    schema: contentBase.extend({
      type: z.literal('tutorial'),
      blenderVersion: z.string().optional().nullable(),
    }),
  }),
  courses: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/courses' }),
    schema: contentBase.extend({ type: z.literal('course') }),
  }),
  addons: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/addons' }),
    schema: contentBase.extend({
      type: z.literal('addon'),
      blenderVersion: z.string().optional().nullable(),
    }),
  }),
  accounts: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/accounts' }),
    schema: z.object({
      type: z.literal('account'),
      name: z.string(),
      url: z.string().url(),
      platform: z.enum(['x', 'instagram', 'youtube', 'web']),
      creator: z.string(),
      language: languageEnum.default('ja'),
      level: z.array(levelEnum),
      categories: z.array(z.string()),
      summary: z.string(),
      followers: z.string().optional().nullable(),
      updatedAt: z.string().optional().nullable(),
      status: statusEnum.default('active'),
    }),
  }),
  routes: defineCollection({
    loader: glob({ pattern: '**/*.md', base: './src/content/routes' }),
    schema: z.object({
      title: z.string(),
      description: z.string(),
      targetLevel: z.string(),
      targetGoal: z.string(),
      estimatedTime: z.string().optional(),
      categories: z.array(z.string()),
      steps: z.array(z.object({
        order: z.number(),
        title: z.string(),
        description: z.string(),
        estimatedTime: z.string().optional(),
        tutorials: z.array(z.string()).optional(),
        courses: z.array(z.string()).optional(),
      })),
      updatedAt: z.string().optional(),
    }),
  }),
};
