import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { apiRequest, getApiErrorMessage } from "../api.js";
import ChatRoom from "./ChatRoom.jsx";
import Dashboard from "./Dashboard.jsx";
import NotificationsPanel from "./NotificationsPanel.jsx";

const roleNames = {
  student: "Student",
  lecturer: "Lecturer",
  admin: "Administrator",
};

const navigationByRole = {
  student: [
    { id: "overview", label: "Overview", icon: "⌂" },
    { id: "classes", label: "My classes", icon: "▦" },
    { id: "assignments", label: "Assignments", icon: "✓" },
    { id: "timetable", label: "Timetable", icon: "◷" },
    { id: "materials", label: "Learning materials", icon: "▤" },
    { id: "announcements", label: "Announcements", icon: "◉" },
    { id: "discussions", label: "Discussions", icon: "☷" },
    { id: "chat", label: "Class chat", icon: "◌" },
    { id: "attendance", label: "Attendance", icon: "▥" },
    { id: "grades", label: "Grades", icon: "⌁" },
    { id: "notifications", label: "Notifications", icon: "♧" },
    { id: "profile", label: "My profile", icon: "◎" },
  ],
  lecturer: [
    { id: "overview", label: "Overview", icon: "⌂" },
    { id: "classes", label: "My classes", icon: "▦" },
    { id: "roster", label: "Class rosters", icon: "♙" },
    { id: "assignments", label: "Assignments", icon: "✓" },
    { id: "quizzes", label: "Quizzes & exams", icon: "▧" },
    { id: "timetable", label: "Timetable", icon: "◷" },
    { id: "materials", label: "Learning materials", icon: "▤" },
    { id: "announcements", label: "Announcements", icon: "◉" },
    { id: "discussions", label: "Discussions", icon: "☷" },
    { id: "chat", label: "Class chat", icon: "◌" },
    { id: "attendance", label: "Attendance", icon: "▥" },
    { id: "grades", label: "Grades", icon: "⌁" },
    { id: "analytics", label: "Class analytics", icon: "⌗" },
    { id: "notifications", label: "Notifications", icon: "♧" },
    { id: "profile", label: "My profile", icon: "◎" },
  ],
  admin: [
    { id: "overview", label: "Overview", icon: "⌂" },
    { id: "students", label: "Students", icon: "♙" },
    { id: "lecturers", label: "Lecturers", icon: "♟" },
    { id: "classes", label: "Classes & courses", icon: "▦" },
    { id: "permissions", label: "Roles & permissions", icon: "⚿" },
    { id: "activity", label: "System activity", icon: "◷" },
    { id: "notifications", label: "Notifications", icon: "♧" },
    { id: "profile", label: "My profile", icon: "◎" },
  ],
};

const sectionContent = {
  assignments: {
    title: "Assignments",
    description: "Review assignments for your classes and keep upcoming work in view.",
    endpoint: "Assignments load from each class using the documented class assignment endpoint.",
  },
  timetable: {
    title: "Timetable",
    description: "Your class schedule and upcoming sessions will appear here.",
    endpoint: "Class timetable endpoint is not yet defined in the API contract.",
  },
  materials: {
    title: "Learning materials",
    description: "Resources shared with your classes will be collected here.",
    endpoint: "Class resource endpoints are not yet defined in the API contract.",
  },
  announcements: {
    title: "Announcements",
    description: "Important updates from your classes will appear here.",
    endpoint: "Class announcement endpoints are not yet defined in the API contract.",
  },
  discussions: {
    title: "Discussions",
    description: "Class discussion threads will be available here.",
    endpoint: "Discussion endpoints are not yet defined in the API contract.",
  },
  chat: {
    title: "Class chat",
    description: "Choose a class room to join a conversation with its members.",
    endpoint: "Chat room history is available at /chat-rooms/{room_id}/messages. WebSocket delivery uses /ws/chat/{room_id}.",
  },
  quizzes: {
    title: "Quizzes & exams",
    description: "Assessments and quiz results will be organized here.",
    endpoint: "Quiz endpoints are not yet defined in the API contract.",
  },
  roster: {
    title: "Class rosters",
    description: "Review students enrolled in each class you teach.",
    endpoint: "Student rosters are loaded from each class using GET /classes/{class_id}/students.",
  },
  analytics: {
    title: "Class analytics",
    description: "Performance, attendance, and completion insights will appear here.",
    endpoint: "Analytics endpoints are not yet defined in the API contract.",
  },
  students: {
    title: "Student management",
    description: "Manage student accounts and their access to the platform.",
    endpoint: "Student administration endpoints are not yet defined in the API contract.",
  },
  lecturers: {
    title: "Lecturer management",
    description: "Manage lecturer accounts and their teaching access.",
    endpoint: "Lecturer administration endpoints are not yet defined in the API contract.",
  },
  permissions: {
    title: "Roles & permissions",
    description: "Review and manage access rules for platform roles.",
    endpoint: "Permission administration endpoints are not yet defined in the API contract.",
  },
  activity: {
    title: "System activity",
    description: "Review permitted system events and account activity.",
    endpoint: "System activity endpoints are not yet defined in the API contract.",
  },
};

function displayName(user) {
  return user?.full_name || user?.name || user?.username || user?.email || "Your account";
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <header className="section-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  );
}

function DataPanel({ title, items, loading, error, emptyMessage }) {
  return (
    <section className="data-panel">
      <div className="panel-heading">
        <h2>{title}</h2>
        <span className="panel-count">{loading ? "Loading" : items.length}</span>
      </div>
      {error && <p className="inline-error" role="alert">{error}</p>}
      {!loading && !error && items.length === 0 && <p className="empty-state">{emptyMessage}</p>}
      {items.length > 0 && (
        <ul className="data-list">
          {items.map((item, index) => (
            <li key={item.id ?? `${item.title ?? item.name}-${index}`}>
              <span className="list-marker" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span>
                <strong>{item.title || item.name || item.course_name || item.type || "Update"}</strong>
                <small>{item.description || item.message || item.code || item.created_at || "Open to view details"}</small>
              </span>
              <span className="list-arrow" aria-hidden="true">↗</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Workspace() {
  const { role, section = "overview" } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [authStatus, setAuthStatus] = useState("checking");
  const [signOutError, setSignOutError] = useState("");
  const [resourceState, setResourceState] = useState({ key: "", status: "idle", items: [], error: "" });
  const requestedPath = useRef(`/workspace/${role}/${section}`);
  const navigation = navigationByRole[role];
  const currentSection = navigation?.find((item) => item.id === section);
  const resourceKey = `${role}:${section}`;
  const hasCurrentResource = resourceState.key === resourceKey;
  const items = hasCurrentResource ? resourceState.items : [];
  const endpointBySection = {
    classes: role === "student" ? "/students/me/classes" : role === "lecturer" ? "/classes" : null,
    grades: role === "student" ? "/students/me/grades" : null,
    attendance: role === "student" ? "/students/me/attendance" : null,
    notifications: "/notifications",
  };
  const resourceEndpoint = endpointBySection[section];
  const loading = hasCurrentResource
    ? resourceState.status === "loading"
    : Boolean(user && (resourceEndpoint || section === "assignments" || section === "roster"));
  const error = hasCurrentResource ? resourceState.error : "";

  useEffect(() => {
    let active = true;
    apiRequest("/auth/me")
      .then((profile) => {
        const normalizedRole = profile?.role?.toLowerCase();
        if (!profile?.role || !["student", "lecturer", "admin"].includes(normalizedRole)) {
          throw new Error("The authenticated profile has no supported role.");
        }
        if (active) {
          setUser({ ...profile, role: normalizedRole });
          setAuthStatus("authenticated");
        }
      })
      .catch(() => {
        if (active) {
          setAuthStatus("anonymous");
          navigate("/login", {
            replace: true,
            state: { from: requestedPath.current, notice: "Sign in to access your workspace." },
          });
        }
      });

    return () => { active = false; };
  }, [navigate]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !user || user.role === role) return;
    navigate(`/workspace/${user.role}/overview`, { replace: true });
  }, [authStatus, navigate, role, user]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !user || !navigation?.some((item) => item.id === section)) return;
    if (section === "overview") return undefined;

    let active = true;
    const request = section === "assignments"
      ? loadClassAssignments(role)
      : section === "roster" && role === "lecturer"
        ? loadClassRosters()
      : resourceEndpoint
        ? apiRequest(resourceEndpoint)
        : null;
    if (!request) return undefined;

    request
      .then((data) => {
        if (active) {
          setResourceState({
            key: resourceKey,
            status: "ready",
            items: Array.isArray(data) ? data : data?.items || [],
            error: "",
          });
        }
      })
      .catch((requestError) => {
        if (active) {
          setResourceState({
            key: resourceKey,
            status: "error",
            items: [],
            error: getApiErrorMessage(requestError),
          });
        }
      });

    return () => { active = false; };
  }, [authStatus, navigation, resourceEndpoint, resourceKey, role, section, user]);

  if (!navigation) {
    return <main className="not-found"><h1>Workspace not found</h1><Link to="/">Return home</Link></main>;
  }

  if (!currentSection) {
    return <main className="not-found"><h1>This section is not available for this role.</h1><Link to={`/workspace/${role}/overview`}>Go to overview</Link></main>;
  }

  if (authStatus !== "authenticated" || user?.role !== role) {
    return <main className="not-found" role="status">Verifying your campus session...</main>;
  }

  const feature = sectionContent[section];
  const isListSection = ["classes", "assignments", "roster", "grades", "attendance", "notifications"].includes(section);
  const userLabel = displayName(user);

  async function signOut() {
    setSignOutError("");
    try {
      await apiRequest("/auth/logout", { method: "POST" });
      navigate("/", { replace: true });
    } catch (logoutError) {
      setSignOutError(getApiErrorMessage(logoutError));
    }
  }

  return (
    <div className="workspace-shell">
      <aside className="sidebar">
        <Link className="brand brand-sidebar" to="/" aria-label="Classroom home">
          <span className="brand-mark">C</span><span>campus<span className="brand-period">.</span></span>
        </Link>
        <div className="sidebar-role">
          <span className="role-dot" />{roleNames[role]} workspace
        </div>
        <nav className="side-navigation" aria-label="Workspace navigation">
          <p className="nav-caption">Workspace</p>
          {navigation.map((item) => (
            <NavLink
              key={item.id}
              to={`/workspace/${role}/${item.id}`}
              className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
              {item.id === "notifications" && <span className="nav-pip" aria-label="Notifications" />}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          {signOutError && <p className="inline-error" role="alert">{signOutError}</p>}
          <div className="account-chip">
            <span className="avatar">{userLabel.slice(0, 1).toUpperCase()}</span>
            <span className="account-details"><strong>{userLabel}</strong><small>{roleNames[role]}</small></span>
          </div>
          <button className="signout-button" onClick={signOut}>Sign out <span aria-hidden="true">↗</span></button>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="topbar">
          <span className="breadcrumb">Campus <span>/</span> {currentSection.label}</span>
          <Link to={`/workspace/${role}/notifications`} className="topbar-action" aria-label="Open notifications">♧</Link>
        </header>
        <div className="workspace-content">
          {section === "overview" ? (
            <Dashboard role={role} user={user} navigation={navigation} />
          ) : (
            <>
              <SectionHeading eyebrow={`${roleNames[role]} workspace`} title={feature?.title || currentSection.label} description={feature?.description || `Keep track of ${currentSection.label.toLowerCase()} for your classes.`} />
              {section === "chat" ? (
                <ChatRoom role={role} />
              ) : section === "notifications" ? (
                <NotificationsPanel />
              ) : isListSection ? (
                <DataPanel
                  title={currentSection.label}
                  items={items}
                  loading={loading}
                  error={error}
                  emptyMessage="Nothing to show just yet. Check back after your account is connected to class data."
                />
              ) : (
                <section className="feature-note">
                  <span className="feature-note-icon" aria-hidden="true">{currentSection.icon}</span>
                  <div><p className="eyebrow">Ready for the next connection</p><h2>{feature?.title || currentSection.label}</h2><p>{feature?.endpoint || "This area will be connected as its API contract is defined."}</p></div>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default Workspace;

async function loadClassAssignments(role) {
  const classEndpoint = role === "student" ? "/students/me/classes" : "/classes";
  const response = await apiRequest(classEndpoint);
  const classes = Array.isArray(response) ? response : response?.items || [];

  const assignmentGroups = await Promise.all(classes.map(async (classItem) => {
    const classId = classItem.id ?? classItem.class_id;
    if (classId == null) return [];

    const assignments = await apiRequest(`/classes/${encodeURIComponent(classId)}/assignments`);
    const assignmentList = Array.isArray(assignments) ? assignments : assignments?.items || [];
    return assignmentList.map((assignment) => ({
      ...assignment,
      class_name: classItem.title || classItem.name || classItem.course_name || classItem.code || "Class",
    }));
  }));

  return assignmentGroups.flat();
}

async function loadClassRosters() {
  const response = await apiRequest("/classes");
  const classes = Array.isArray(response) ? response : response?.items || [];
  const rosterGroups = await Promise.all(classes.map(async (classItem) => {
    const classId = classItem.id ?? classItem.class_id;
    if (classId == null) return [];

    const rosterResponse = await apiRequest(`/classes/${encodeURIComponent(classId)}/students`);
    const students = Array.isArray(rosterResponse) ? rosterResponse : rosterResponse?.items || [];
    const className = classItem.title || classItem.name || classItem.course_name || classItem.code || "Class";
    return students.map((student) => ({
      ...student,
      title: student.full_name || student.name || student.username || student.email || `Student ${student.id ?? ""}`,
      description: className,
    }));
  }));

  return rosterGroups.flat();
}