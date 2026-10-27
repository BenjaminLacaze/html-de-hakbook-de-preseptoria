// Estado de las pantallas rescatadas, igual que lo manejaba la App.tsx original de
// "julian appcompleta" (datos de ejemplo en memoria). En modo API, la asistencia del
// preceptor se reemplaza por datos reales (ver useApiAttendance.ts); el resto sigue acá
// hasta que tenga su conexión a la API (backlog INT-93 a INT-95).
import { useEffect, useState } from 'react';
import type { BorderStyle, FontStyle, Theme } from '../legacy/App';
import {
  INITIAL_ATTENDANCE,
  INITIAL_DAILY_TASKS,
  INITIAL_FORUM_REPLIES,
  INITIAL_FORUM_THREADS,
  INITIAL_INCIDENTS,
  INITIAL_INSTALLATIONS,
  INITIAL_MAINTENANCE_HISTORY,
  INITIAL_NOTIFICATIONS,
  INITIAL_PRIVATE_MESSAGES,
  INITIAL_STUDENT_REP_ANNOUNCEMENTS,
  INITIAL_STUDENT_REP_CLAIMS,
  INITIAL_STUDENT_REP_EVENTS,
  INITIAL_STUDENT_REP_REPLIES,
  INITIAL_STUDENT_REP_THREADS,
  INITIAL_USERS,
  NEWS_ITEMS,
} from '../legacy/constants';
import {
  AttendanceStatus,
  type AttendanceRecord,
  type CalendarEvent,
  type DailyTask,
  type ForumReply,
  type ForumThread,
  type Incident,
  type Installation,
  type MaintenanceHistoryItem,
  type NewsItem,
  type Note,
  type Notification,
  type PrivateMessage,
  type StudentRepAnnouncement,
  type StudentRepClaim,
  type StudentRepEvent,
  type StudentRepForumReply,
  type StudentRepForumThread,
  type User,
  type UserProfileData,
} from '../legacy/types';

export function useLegacyStore() {
  const [users] = useState<User[]>(INITIAL_USERS);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE);
  const [newsItems, setNewsItems] = useState<NewsItem[]>(NEWS_ITEMS);
  const [privateMessages, setPrivateMessages] = useState<PrivateMessage[]>(INITIAL_PRIVATE_MESSAGES);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [forumThreads, setForumThreads] = useState<ForumThread[]>(INITIAL_FORUM_THREADS);
  const [forumReplies, setForumReplies] = useState<ForumReply[]>(INITIAL_FORUM_REPLIES);
  const [userProfiles, setUserProfiles] = useState<Record<number, UserProfileData>>({});
  const [userNotes, setUserNotes] = useState<Record<number, Note[]>>({});
  const [customEvents, setCustomEvents] = useState<CalendarEvent[]>([]);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(INITIAL_DAILY_TASKS);
  const [maintenanceHistory, setMaintenanceHistory] = useState<MaintenanceHistoryItem[]>(INITIAL_MAINTENANCE_HISTORY);
  const [installations, setInstallations] = useState<Installation[]>(INITIAL_INSTALLATIONS);
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [studentRepEvents, setStudentRepEvents] = useState<StudentRepEvent[]>(INITIAL_STUDENT_REP_EVENTS);
  const [eventParticipants, setEventParticipants] = useState<Record<string, number[]>>({});
  const [studentRepThreads, setStudentRepThreads] = useState<StudentRepForumThread[]>(INITIAL_STUDENT_REP_THREADS);
  const [studentRepReplies, setStudentRepReplies] = useState<StudentRepForumReply[]>(INITIAL_STUDENT_REP_REPLIES);
  const [studentRepAnnouncements, setStudentRepAnnouncements] =
    useState<StudentRepAnnouncement[]>(INITIAL_STUDENT_REP_ANNOUNCEMENTS);
  const [studentRepClaims, setStudentRepClaims] = useState<StudentRepClaim[]>(INITIAL_STUDENT_REP_CLAIMS);

  const [theme, setTheme] = useState<Theme>('institucional');
  const [borderStyle, setBorderStyle] = useState<BorderStyle>('sencillo');
  const [fontStyle, setFontStyle] = useState<FontStyle>('institucional');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-border-style', borderStyle);
    document.documentElement.setAttribute('data-font-style', fontStyle);
  }, [theme, borderStyle, fontStyle]);

  const addNotification = (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) =>
    setNotifications((prev) => [{ ...n, id: `notif-${Date.now()}`, timestamp: new Date().toISOString(), read: false }, ...prev]);

  /** Props comunes a los tres tableros (las mismas que armaba la App original). */
  const commonProps = (currentUser: User, onLogout: () => void) => ({
    user: currentUser,
    onLogout,
    allUsers: users,
    userProfiles,
    onUpdateProfile: (userId: number, data: UserProfileData) => setUserProfiles((p) => ({ ...p, [userId]: data })),
    userNotes: userNotes[currentUser.id] || [],
    onUpdateNotes: (notes: Note[]) => setUserNotes((p) => ({ ...p, [currentUser.id]: notes })),
    theme,
    setTheme,
    borderStyle,
    setBorderStyle,
    fontStyle,
    setFontStyle,
    notifications,
    markNotificationsAsRead: (userId: number) =>
      setNotifications((prev) => prev.map((n) => (n.userId === userId ? { ...n, read: true } : n))),
    addNotification,
  });

  /** Asistencia en memoria (modo demo): misma lógica que la App original. */
  const demoAttendance = {
    attendanceRecords,
    addAttendanceRecord: (updates: { studentId: number; status: AttendanceStatus }[], date: string, subjectId: string) => {
      const newRecords = updates.map((u) => ({
        id: `att-${u.studentId}-${subjectId}-${date}`,
        studentId: u.studentId,
        subjectId,
        date,
        status: u.status,
      }));
      setAttendanceRecords((prev) => [
        ...prev.filter((r) => !(r.date === date && r.subjectId === subjectId && newRecords.some((nr) => nr.studentId === r.studentId))),
        ...newRecords,
      ]);
    },
    updateAttendanceStatus: (recordId: string, newStatus: AttendanceStatus) =>
      setAttendanceRecords((prev) => prev.map((r) => (r.id === recordId ? { ...r, status: newStatus } : r))),
    resolveJustificationRequest: (recordId: string, approved: boolean) =>
      setAttendanceRecords((prev) =>
        prev.map((r) =>
          r.id === recordId
            ? { ...r, status: approved ? AttendanceStatus.JUSTIFIED : AttendanceStatus.ABSENT, justificationReason: undefined, justificationFile: undefined }
            : r,
        ),
      ),
  };

  return {
    users,
    commonProps,
    demoAttendance,
    newsItems,
    setNewsItems,
    privateMessages,
    setPrivateMessages,
    forumThreads,
    setForumThreads,
    forumReplies,
    setForumReplies,
    customEvents,
    setCustomEvents,
    dailyTasks,
    setDailyTasks,
    maintenanceHistory,
    setMaintenanceHistory,
    installations,
    setInstallations,
    incidents,
    setIncidents,
    studentRepEvents,
    setStudentRepEvents,
    eventParticipants,
    setEventParticipants,
    studentRepThreads,
    setStudentRepThreads,
    studentRepReplies,
    setStudentRepReplies,
    studentRepAnnouncements,
    setStudentRepAnnouncements,
    studentRepClaims,
    setStudentRepClaims,
  };
}

export type LegacyStore = ReturnType<typeof useLegacyStore>;
