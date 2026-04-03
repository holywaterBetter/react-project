import type { DevUserMode } from '@features/auth/types/devUserMode';
import type { OrganizationRecord } from '@shared-types/org';

export const isKoreanLanguage = (language: string) => language.toLowerCase().startsWith('ko');

export const getLocalizedOrgDivisionName = (record: OrganizationRecord, language: string) =>
  isKoreanLanguage(language) ? record.org_division_name : record.org_division_name_en || record.org_division_name;

export const getLocalizedOrgCategoryName = (record: OrganizationRecord, language: string) =>
  isKoreanLanguage(language) ? record.org_category_name : record.org_category_name_en || record.org_category_name;

export const getLocalizedOrgDepartmentName = (record: OrganizationRecord, language: string) =>
  isKoreanLanguage(language) ? record.org_department_name : record.org_department_name_en || record.org_department_name;

export const getLocalizedUserName = (user: DevUserMode, language: string) =>
  isKoreanLanguage(language) ? user.name : user.nameEn;
