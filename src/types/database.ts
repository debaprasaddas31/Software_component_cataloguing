export interface User {
  id: string;
  name: string;
  email: string;
  phone_number?: string;
  role: 'admin' | 'regular';
  created_at: string;
  last_login?: string;
}

export interface Component {
  id: string;
  componentName: string;
  componentType: 'code' | 'design';
  description?: string;
  componentCategory: string;
  keywords: string[];
  programmingLanguage?: string;
  designNotation?: 'UML' | 'ERD' | 'Structured Design' | 'Other';
  codeBlock?: string;
  designFile?: string;
  usageCount: number;
  queryCount: number;
  lastUsed?: Date;
  createdBy: string;
  timestamp: Date;
  status: 'active' | 'archived';
  version: string;
  dependencies?: string[];
  parentCategory?: string;
}