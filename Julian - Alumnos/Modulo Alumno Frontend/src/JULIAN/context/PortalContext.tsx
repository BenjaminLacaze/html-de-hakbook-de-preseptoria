import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  MOCK_CALENDAR_EVENTS,
  MOCK_COMMUNITY,
  MOCK_FORUMS,
  MOCK_GRADES,
  MOCK_NOTICES,
  MOCK_NOTIFICATIONS,
  MOCK_STUDENT,
  MOCK_SUBJECTS
} from '../data/mockData';
import { apiService } from '../services/apiService';
import { DEFAULT_APPEARANCE, THEMES, ThemeColors } from '../styles/themes';
import {
  AcademicNotice,
  ActiveSection,
  AppearanceSettings,
  AttendanceRecord,
  CalendarEvent,
  CommunityMember,
  ForumTopic,
  Grade,
  NotificationItem,
  StudentProfile,
  Subject
} from '../types';

interface PortalContextType {
  activeSection: ActiveSection;
  setActiveSection: (section: ActiveSection) => void;
  student: StudentProfile;
  subjects: Subject[];
  grades: Grade[];
  attendanceRecords: AttendanceRecord[];
  calendarEvents: CalendarEvent[];
  notices: AcademicNotice[];
  community: CommunityMember[];
  forums: ForumTopic[];
  notifications: NotificationItem[];
  appearance: AppearanceSettings;
  themeColors: ThemeColors;
  updateAppearance: (settings: Partial<AppearanceSettings>) => void;
  selectedSubject: Subject | null;
  setSelectedSubject: (subject: Subject | null) => void;
  justifyingRecord: AttendanceRecord | null;
  setJustifyingRecord: (record: AttendanceRecord | null) => void;
  submitJustification: (recordId: string, reason: string, attachmentName?: string) => Promise<boolean>;
  validateQR: (token: string) => Promise<{ success: boolean; message: string; recordedAt?: string }>;
  postReply: (topicId: string, content: string) => Promise<void>;
  createTopic: (title: string, content: string, subjectName: string, tags: string[]) => Promise<void>;
  markNoticeRead: (id: string) => void;
  markNotificationsAsRead: () => void;
  isLogoutModalOpen: boolean;
  setIsLogoutModalOpen: (open: boolean) => void;
  isSessionActive: boolean;
  logout: () => void;
  reloginDemo: () => void;
  // Computed academic stats
  totalAbsences: number;
  totalPresent: number;
  overallAttendanceRate: number;
  currentGpa: number;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

const SETTINGS_STORAGE_KEY = 'asistencia_terciario_julian_appearance_v2';

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<ActiveSection>('inicio');
  const [student] = useState<StudentProfile>(MOCK_STUDENT);
  const [subjects] = useState<Subject[]>(MOCK_SUBJECTS);
  const [grades] = useState<Grade[]>(MOCK_GRADES);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [calendarEvents] = useState<CalendarEvent[]>(MOCK_CALENDAR_EVENTS);
  const [notices, setNotices] = useState<AcademicNotice[]>(MOCK_NOTICES);
  const [community] = useState<CommunityMember[]>(MOCK_COMMUNITY);
  const [forums, setForums] = useState<ForumTopic[]>(MOCK_FORUMS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [justifyingRecord, setJustifyingRecord] = useState<AttendanceRecord | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(true);

  // Initialize appearance from localStorage
  const [appearance, setAppearance] = useState<AppearanceSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) return { ...DEFAULT_APPEARANCE, ...JSON.parse(saved) };
    } catch (e) {
      console.warn('Could not read stored appearance settings', e);
    }
    return DEFAULT_APPEARANCE;
  });

  const themeColors = THEMES[appearance.theme] || THEMES.celestial;

  // Load attendance & forums on mount
  useEffect(() => {
    apiService.getAttendanceRecords().then(setAttendanceRecords);
    apiService.getForums().then(setForums);
  }, []);

  // Update appearance & persist
  const updateAppearance = (newSettings: Partial<AppearanceSettings>) => {
    setAppearance((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save appearance settings', e);
      }
      return updated;
    });
  };

  // Submit justification
  const submitJustification = async (recordId: string, reason: string, attachmentName?: string) => {
    try {
      const res = await apiService.submitAttendanceJustification(recordId, reason, attachmentName);
      if (res.success) {
        setAttendanceRecords((prev) =>
          prev.map((r) => (r.id === recordId ? res.updatedRecord : r))
        );
        return true;
      }
    } catch (err) {
      console.error(err);
    }
    return false;
  };

  // Validate QR checkin
  const validateQR = async (token: string) => {
    const res = await apiService.validateQRAttendance(token, student.id);
    if (res.success) {
      const refreshed = await apiService.getAttendanceRecords();
      setAttendanceRecords(refreshed);
    }
    return {
      success: res.success,
      message: res.message,
      recordedAt: res.recordedAt
    };
  };

  // Forum actions
  const postReply = async (topicId: string, content: string) => {
    const reply = await apiService.addForumReply(topicId, content);
    setForums((prev) =>
      prev.map((t) => {
        if (t.id === topicId) {
          return {
            ...t,
            replies: [...t.replies, reply]
          };
        }
        return t;
      })
    );
  };

  const createTopic = async (title: string, content: string, subjectName: string, tags: string[]) => {
    const newTopic = await apiService.createForumTopic(title, content, subjectName, tags);
    setForums((prev) => [newTopic, ...prev]);
  };

  const markNoticeRead = (id: string) => {
    setNotices((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const logout = () => {
    setIsLogoutModalOpen(false);
    setIsSessionActive(false);
  };

  const reloginDemo = () => {
    setIsSessionActive(true);
    setActiveSection('inicio');
  };

  // Computations
  const totalAbsences = attendanceRecords.filter((r) => r.status === 'Ausente').length;
  const totalPresent = attendanceRecords.filter((r) => r.status === 'Presente').length;
  const totalRecords = attendanceRecords.length;
  const overallAttendanceRate = totalRecords > 0 ? Math.round((totalPresent / totalRecords) * 1000) / 10 : 91.3;

  const publishedGrades = grades.filter((g) => g.score !== null && g.status === 'Publicada');
  const sumScores = publishedGrades.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const currentGpa = publishedGrades.length > 0 ? Math.round((sumScores / publishedGrades.length) * 100) / 100 : 8.42;

  return (
    <PortalContext.Provider
      value={{
        activeSection,
        setActiveSection,
        student,
        subjects,
        grades,
        attendanceRecords,
        calendarEvents,
        notices,
        community,
        forums,
        notifications,
        appearance,
        themeColors,
        updateAppearance,
        selectedSubject,
        setSelectedSubject,
        justifyingRecord,
        setJustifyingRecord,
        submitJustification,
        validateQR,
        postReply,
        createTopic,
        markNoticeRead,
        markNotificationsAsRead,
        isLogoutModalOpen,
        setIsLogoutModalOpen,
        isSessionActive,
        logout,
        reloginDemo,
        totalAbsences,
        totalPresent,
        overallAttendanceRate,
        currentGpa
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

export const usePortal = () => {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error('usePortal must be used within a PortalProvider');
  }
  return context;
};
