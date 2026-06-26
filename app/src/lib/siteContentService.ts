import {
  DEFAULT_NAV_MENU_ITEMS,
  DEFAULT_SITE_CONTENT,
  normalizePhoneRaw,
  type NavMenuItem,
  type SiteContent,
} from '../data/landingContent';
import { siteContentApi } from './apiService';

export const SITE_CONTENT_STORAGE_KEY = 'demo_library_site_content';
export const SITE_CONTENT_UPDATED_EVENT = 'site-content-updated';

function mergeStringFields<T extends Record<string, string>>(
  defaults: T,
  ...sources: Array<Partial<T> | undefined>
): T {
  const result = { ...defaults };
  for (const source of sources) {
    if (!source) continue;
    for (const key of Object.keys(defaults) as Array<keyof T>) {
      const value = source[key];
      if (value !== undefined && value !== null) {
        result[key] = String(value) as T[keyof T];
      }
    }
  }
  return result;
}

function buildNavMenuFromPageText(pageText: SiteContent['pageText']): NavMenuItem[] {
  return [
    { id: 1, label: pageText.navHome, sectionId: 'home' },
    { id: 2, label: pageText.navAbout, sectionId: 'about' },
    { id: 3, label: pageText.navStats, sectionId: 'stats' },
    { id: 4, label: 'Gallery', sectionId: 'gallery' },
    { id: 5, label: pageText.navContact, sectionId: 'contact' },
    { id: 6, label: 'Computer Classes', sectionId: '/computer-center' },
  ];
}

function resolveNavMenuItems(saved: Partial<SiteContent>): NavMenuItem[] {
  let items: NavMenuItem[];
  if (saved.navMenuItems && saved.navMenuItems.length > 0) {
    items = saved.navMenuItems.map((item) => ({
      id: item.id,
      label: item.label?.trim() || 'Link',
      sectionId: item.sectionId?.trim() || 'home',
    }));
  } else {
    const pageText = mergeStringFields(DEFAULT_SITE_CONTENT.pageText, saved.pageText);
    items = buildNavMenuFromPageText(pageText);
  }

  // Ensure Computer Classes is always present
  if (!items.find((item) => item.sectionId === '/computer-center')) {
    items.push({
      id: items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1,
      label: 'Computer Classes',
      sectionId: '/computer-center',
    });
  }

  return items;
}

export function mergeSiteContent(saved: Partial<SiteContent>): SiteContent {
  const libraryInfo = mergeStringFields(
    DEFAULT_SITE_CONTENT.libraryInfo,
    saved.libraryInfo
  );

  return {
    announcement: {
      title: saved.announcement?.title ?? DEFAULT_SITE_CONTENT.announcement?.title ?? '',
      text: saved.announcement?.text ?? DEFAULT_SITE_CONTENT.announcement?.text ?? '',
      link: saved.announcement?.link ?? DEFAULT_SITE_CONTENT.announcement?.link ?? '',
      endDate: saved.announcement?.endDate ?? DEFAULT_SITE_CONTENT.announcement?.endDate ?? '',
      show: saved.announcement?.show ?? DEFAULT_SITE_CONTENT.announcement?.show ?? false,
      upcomingText: saved.announcement?.upcomingText ?? DEFAULT_SITE_CONTENT.announcement?.upcomingText ?? '',
    },
    libraryInfo,
    admissionContact: mergeStringFields(
      DEFAULT_SITE_CONTENT.admissionContact,
      saved.admissionContact,
      saved.admissionContact ? undefined : {
        title: saved.pageText?.contactSecondTitle ?? DEFAULT_SITE_CONTENT.admissionContact.title,
        phone: libraryInfo.phone,
        phoneRaw: libraryInfo.phoneRaw,
        email: libraryInfo.email,
        address: libraryInfo.address,
        mapUrl: libraryInfo.mapUrl,
        whatsappMessage: libraryInfo.whatsappMessage,
      }
    ),
    pageText: mergeStringFields(DEFAULT_SITE_CONTENT.pageText, saved.pageText),
    navMenuItems: resolveNavMenuItems(saved),
    heroSlides:
      saved.heroSlides && saved.heroSlides.length > 0
        ? saved.heroSlides
        : DEFAULT_SITE_CONTENT.heroSlides,
    aboutContent: {
      ...DEFAULT_SITE_CONTENT.aboutContent,
      ...saved.aboutContent,
      title:
        saved.aboutContent?.title?.trim() ||
        DEFAULT_SITE_CONTENT.aboutContent.title,
      paragraphs:
        saved.aboutContent?.paragraphs && saved.aboutContent.paragraphs.length > 0
          ? saved.aboutContent.paragraphs
          : DEFAULT_SITE_CONTENT.aboutContent.paragraphs,
      highlights:
        saved.aboutContent?.highlights && saved.aboutContent.highlights.length > 0
          ? saved.aboutContent.highlights
          : DEFAULT_SITE_CONTENT.aboutContent.highlights,
    },
    galleryImages:
      saved.galleryImages && saved.galleryImages.length > 0
        ? saved.galleryImages
        : DEFAULT_SITE_CONTENT.galleryImages,
    facultyMembers:
      saved.facultyMembers && saved.facultyMembers.length > 0
        ? saved.facultyMembers
        : DEFAULT_SITE_CONTENT.facultyMembers,
    computerCenterTeachers:
      saved.computerCenterTeachers && saved.computerCenterTeachers.length > 0
        ? saved.computerCenterTeachers
        : DEFAULT_SITE_CONTENT.computerCenterTeachers,
    computerCourses:
      saved.computerCourses && saved.computerCourses.length > 0
        ? saved.computerCourses
        : DEFAULT_SITE_CONTENT.computerCourses,
    updatedAt: saved.updatedAt,
  };
}

export function getStoredSiteContent(): SiteContent | null {
  try {
    const raw = localStorage.getItem(SITE_CONTENT_STORAGE_KEY);
    if (!raw) return null;
    return mergeSiteContent(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveStoredSiteContent(content: SiteContent, dispatch: boolean = true) {
  localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(content));
  if (dispatch) {
    window.dispatchEvent(new CustomEvent(SITE_CONTENT_UPDATED_EVENT));
  }
}

export function clearStoredSiteContent() {
  localStorage.removeItem(SITE_CONTENT_STORAGE_KEY);
}

export function prepareSiteContentForSave(content: SiteContent): SiteContent {
  const phoneRaw = content.libraryInfo.phoneRaw || normalizePhoneRaw(content.libraryInfo.phone);
  const admissionPhoneRaw =
    content.admissionContact.phoneRaw || normalizePhoneRaw(content.admissionContact.phone);

  const galleryImages = content.galleryImages.map((img) => {
    const title = (img.title ?? '').trim();
    const src = (img.src ?? '').trim();
    const alt = (img.alt ?? '').trim() || title;
    return { ...img, title, src, alt };
  });

  const facultyMembers = content.facultyMembers.map((member) => ({
    ...member,
    photo: (member.photo ?? '').trim(),
    name: (member.name ?? '').trim(),
    role: (member.role ?? '').trim(),
    detail: (member.detail ?? '').trim(),
  }));

  const computerCenterTeachers = (content.computerCenterTeachers || []).map((member) => ({
    ...member,
    photo: (member.photo ?? '').trim(),
    name: (member.name ?? '').trim(),
    role: (member.role ?? '').trim(),
    detail: (member.detail ?? '').trim(),
  }));

  const navMenuItems =
    content.navMenuItems && content.navMenuItems.length > 0
      ? content.navMenuItems.map((item) => ({
          id: item.id,
          label: (item.label ?? '').trim() || 'Link',
          sectionId: (item.sectionId ?? '').trim() || 'home',
        }))
      : DEFAULT_NAV_MENU_ITEMS;

  const announcement = content.announcement
    ? {
        title: (content.announcement.title ?? '').trim(),
        text: (content.announcement.text ?? '').trim(),
        link: (content.announcement.link ?? '').trim(),
        endDate: (content.announcement.endDate ?? '').trim(),
        show: content.announcement.show ?? false,
        upcomingText: (content.announcement.upcomingText ?? '').trim(),
      }
    : DEFAULT_SITE_CONTENT.announcement;

  return {
    ...content,
    announcement,
    libraryInfo: {
      ...content.libraryInfo,
      phoneRaw,
      mapUrl: (content.libraryInfo.mapUrl ?? '').trim(),
    },
    admissionContact: {
      ...content.admissionContact,
      title: (content.admissionContact.title ?? '').trim() || DEFAULT_SITE_CONTENT.admissionContact.title,
      phoneRaw: admissionPhoneRaw,
      mapUrl: (content.admissionContact.mapUrl ?? '').trim(),
    },
    navMenuItems,
    galleryImages,
    facultyMembers,
    computerCenterTeachers,
    aboutContent: {
      ...content.aboutContent,
      paragraphs: content.aboutContent.paragraphs.filter((p) => p.trim()),
    },
    updatedAt: new Date().toISOString(),
  };
}

export type LoadSiteContentResult = {
  content: SiteContent;
  fromApi: boolean;
};

/** API is source of truth so every visitor sees the same content. */
export async function loadSiteContent(): Promise<LoadSiteContentResult> {
  try {
    const data = await siteContentApi.get();
    const apiContent = mergeSiteContent(data);
    saveStoredSiteContent(apiContent, false);
    return { content: apiContent, fromApi: true };
  } catch (error) {
    console.warn('Could not load site content from API, using local fallback:', error);
    const stored = getStoredSiteContent();
    return {
      content: stored ?? DEFAULT_SITE_CONTENT,
      fromApi: false,
    };
  }
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  const payload = prepareSiteContentForSave(content);
  await siteContentApi.update(payload);
  saveStoredSiteContent(payload);
}

export async function resetSiteContentToDefaults(): Promise<SiteContent> {
  clearStoredSiteContent();
  const payload = prepareSiteContentForSave(DEFAULT_SITE_CONTENT);

  try {
    await siteContentApi.update(payload);
  } catch {
    // offline — defaults still apply
  }

  return DEFAULT_SITE_CONTENT;
}
