import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest, getApiErrorMessage } from "../api.js";

const studentDashboardEndpoints = {
  classes: "/students/me/classes",
  grades: "/students/me/grades",
  attendance: "/students/me/attendance",
  notifications: "/notifications",
};

function toList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function getUnreadCount(notifications) {
  return notifications.filter((notification) => notification.is_read === false).length;
}

async function loadDashboardData(role) {
  const endpoints = role === "student"
    ? studentDashboardEndpoints
    : { classes: "/classes", notifications: "/notifications" };
  const entries = await Promise.all(
    Object.entries(endpoints).map(async ([key, endpoint]) => [key, toList(await apiRequest(endpoint))]),
  );
  const summary = Object.fromEntries(entries);
  const classItems = summary.classes || [];
  const assignmentGroups = await Promise.all(classItems.map(async (classItem) => {
    const classId = classItem.id ?? classItem.class_id;
    if (classId == null) return [];

    try {
      const assignments = toList(await apiRequest(`/classes/${encodeURIComponent(classId)}/assignments`));
      return assignments.map((assignment) => ({
        ...assignment,
        class_id: classId,
        class_name: classItem.title || classItem.name || classItem.course_name || classItem.code || "Class",
      }));
    } catch {
      return [];
    }
  }));
  summary.assignments = assignmentGroups.flat();

  if (role === "lecturer") {
    const submissionGroups = await Promise.all(summary.assignments.map(async (assignment) => {
      const assignmentId = assignment.id ?? assignment.assignment_id;
      if (assignmentId == null) return [];

      try {
        const submissions = toList(await apiRequest(`/assignments/${encodeURIComponent(assignmentId)}/submissions`));
        return submissions.map((submission) => ({
          ...submission,
          assignment_title: assignment.title || "Assignment",
          class_name: assignment.class_name,
        }));
      } catch {
        return [];
      }
    }));
    summary.submissions = submissionGroups.flat();
  }

  return summary;
}

function AssignmentList({ assignments, emptyMessage }) {
  if (assignments.length === 0) return <p className="empty-state">{emptyMessage}</p>;

  return (
    <ul className="data-list">
      {assignments.slice(0, 6).map((assignment, index) => (
        <li key={assignment.id ?? assignment.assignment_id ?? `${assignment.class_id}-${index}`}>
          <span className="list-marker" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <span>
            <strong>{assignment.title || "Untitled assignment"}</strong>
            <small>{assignment.class_name}{assignment.due_at ? ` · Due ${new Date(assignment.due_at).toLocaleDateString()}` : ""}</small>
          </span>
          <span className="list-arrow" aria-hidden="true">↗</span>
        </li>
      ))}
    </ul>
  );
}

function AssignmentComposer({ classes, onCreated }) {
  const [form, setForm] = useState({
    classId: "",
    title: "",
    description: "",
    dueAt: "",
    maxScore: "100",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.classId) {
      setError("Choose a class before creating an assignment.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      await apiRequest(`/classes/${encodeURIComponent(form.classId)}/assignments`, {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          due_at: new Date(form.dueAt).toISOString(),
          max_score: Number(form.maxScore),
        }),
      });
      setForm({ classId: "", title: "", description: "", dueAt: "", maxScore: "100" });
      onCreated();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="data-panel">
      <div className="panel-heading"><h2>Create an assignment</h2></div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="assignment-class">Class</label>
        <select id="assignment-class" value={form.classId} onChange={(event) => setForm({ ...form, classId: event.target.value })} required>
          <option value="">Choose a class</option>
          {classes.map((classItem, index) => {
            const classId = classItem.id ?? classItem.class_id;
            return classId == null ? null : (
              <option key={classId ?? index} value={classId}>
                {classItem.title || classItem.name || classItem.course_name || classItem.code || `Class ${classId}`}
              </option>
            );
          })}
        </select>
        <label htmlFor="assignment-title">Title</label>
        <input id="assignment-title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required maxLength={160} />
        <label htmlFor="assignment-description">Description</label>
        <textarea id="assignment-description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required rows={3} />
        <label htmlFor="assignment-due">Due date and time</label>
        <input id="assignment-due" type="datetime-local" value={form.dueAt} onChange={(event) => setForm({ ...form, dueAt: event.target.value })} required />
        <label htmlFor="assignment-score">Maximum score</label>
        <input id="assignment-score" type="number" min="1" step="any" value={form.maxScore} onChange={(event) => setForm({ ...form, maxScore: event.target.value })} required />
        {error && <p className="inline-error" role="alert">{error}</p>}
        <button type="submit" disabled={isSubmitting || classes.length === 0}>
          {isSubmitting ? "Creating..." : "Create assignment"}
        </button>
        {classes.length === 0 && <p className="empty-state">A class is required before you can create an assignment.</p>}
      </form>
    </section>
  );
}

function Dashboard({ role, user, navigation }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [dashboardState, setDashboardState] = useState(() => ({
    role,
    status: role === "admin" ? "ready" : "loading",
    summary: {},
    error: "",
  }));
  const isCurrentRole = dashboardState.role === role;
  const summary = isCurrentRole ? dashboardState.summary : {};
  const loading = isCurrentRole
    ? dashboardState.status === "loading"
    : role !== "admin";
  const error = isCurrentRole ? dashboardState.error : "";
  const firstName = user?.full_name?.split(" ")[0]
    || user?.name?.split(" ")[0]
    || user?.username
    || "there";

  useEffect(() => {
    let active = true;
    if (role === "admin") {
      return () => { active = false; };
    }

    loadDashboardData(role)
      .then((summary) => {
        if (active) {
          setDashboardState({
            role,
            status: "ready",
            summary,
            error: "",
          });
        }
      })
      .catch((requestError) => {
        if (active) {
          setDashboardState({
            role,
            status: "error",
            summary: {},
            error: getApiErrorMessage(requestError),
          });
        }
      });

    return () => { active = false; };
  }, [refreshKey, role]);

  const metrics = role === "student"
    ? [
        { label: "Enrolled classes", value: summary.classes?.length ?? "—", destination: "classes" },
        { label: "Available assignments", value: summary.assignments?.length ?? "—", destination: "assignments" },
        { label: "Grade records", value: summary.grades?.length ?? "—", destination: "grades" },
        { label: "Attendance records", value: summary.attendance?.length ?? "—", destination: "attendance" },
        { label: "Unread updates", value: summary.notifications ? getUnreadCount(summary.notifications) : "—", destination: "notifications" },
      ]
    : [
        { label: "Teaching classes", value: summary.classes?.length ?? "—", destination: "classes" },
        { label: "Assignments", value: summary.assignments?.length ?? "—", destination: "assignments" },
        { label: "Submissions received", value: summary.submissions?.length ?? "—", destination: "assignments" },
        { label: "Unread updates", value: summary.notifications ? getUnreadCount(summary.notifications) : "—", destination: "notifications" },
      ];

  return (
    <>
      <header className="section-heading">
        <p className="eyebrow">{role === "admin" ? "Administration" : `${role} workspace`}</p>
        <h1>Good to see you, {firstName}.</h1>
        <p>{role === "student"
          ? "Your classes, progress, attendance, and campus updates at a glance."
          : role === "lecturer"
            ? "Your teaching spaces and campus updates, all in one place."
            : "Manage campus accounts, courses, and access from one place."}</p>
      </header>

      {error && <p className="inline-error" role="alert">{error}</p>}

      {role !== "admin" ? (
        <section aria-label="Workspace summary">
          <h2>At a glance</h2>
          <div className="metric-grid">
            {metrics.map((metric) => (
              <Link key={metric.label} className="metric-item" to={`/workspace/${role}/${metric.destination}`}>
                <span>{metric.label}</span>
                <strong>{loading ? "..." : metric.value}</strong>
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <section aria-label="Administration workspace">
          <h2>Campus administration</h2>
          <p>Choose an area to manage. User and class management APIs are not included in the current frontend contract yet.</p>
        </section>
      )}

      <section className="dashboard-sections" aria-label="Workspace sections">
        <h2>{role === "student" ? "Keep learning" : role === "lecturer" ? "Teaching tools" : "Administration"}</h2>
        <div className="quick-link-grid">
          {navigation
            .filter((item) => item.id !== "overview" && item.id !== "notifications")
            .map((item, index) => (
              <Link key={item.id} to={`/workspace/${role}/${item.id}`} className="quick-link">
                <span className={`quick-link-index tone-${index % 4}`} aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
                <span className="list-arrow" aria-hidden="true">↗</span>
              </Link>
            ))}
        </div>
      </section>

      {role === "lecturer" && (
        <AssignmentComposer
          classes={summary.classes || []}
          onCreated={() => setRefreshKey((currentKey) => currentKey + 1)}
        />
      )}

      <section className="data-panel">
        <div className="panel-heading">
          <h2>{role === "student" ? "Assignments to work on" : "Assignments you set"}</h2>
          <Link to={`/workspace/${role}/assignments`}>All assignments <span aria-hidden="true">↗</span></Link>
        </div>
        {loading ? <p className="empty-state">Loading assignments...</p> : (
          <AssignmentList
            assignments={summary.assignments || []}
            emptyMessage={role === "student"
              ? "Assignments from your enrolled classes will appear here."
              : "Create an assignment after your teaching classes are available."}
          />
        )}
      </section>

      {role === "lecturer" && (
        <section className="data-panel">
          <div className="panel-heading">
            <h2>Submissions received</h2>
            <Link to={`/workspace/${role}/assignments`}>Review <span aria-hidden="true">↗</span></Link>
          </div>
          {loading ? <p className="empty-state">Loading submissions...</p> : (summary.submissions || []).length === 0 ? (
            <p className="empty-state">Submissions will appear here as students turn in their work.</p>
          ) : (
            <ul className="data-list">
              {summary.submissions.slice(0, 6).map((submission, index) => (
                <li key={submission.id ?? submission.submission_id ?? index}>
                  <span className="list-marker" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <span>
                    <strong>{submission.student_name || submission.student?.name || submission.student_id || "Student submission"}</strong>
                    <small>{submission.assignment_title} · {submission.class_name}</small>
                  </span>
                  <span>{submission.status || (submission.grade != null ? "Graded" : "Review")}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="data-panel">
        <div className="panel-heading">
          <h2>{role === "student" ? "Your classes" : role === "lecturer" ? "Your teaching spaces" : "Platform status"}</h2>
          <Link to={`/workspace/${role}/${role === "admin" ? "classes" : "classes"}`}>Open <span aria-hidden="true">↗</span></Link>
        </div>
        {loading && <p className="empty-state">Loading your workspace summary...</p>}
        {!loading && !error && role !== "admin" && (summary.classes?.length ?? 0) === 0 && (
          <p className="empty-state">Your classes will appear here when they are available.</p>
        )}
        {!loading && !error && summary.classes?.length > 0 && (
          <ul className="data-list">
            {summary.classes.slice(0, 5).map((classItem, index) => (
              <li key={classItem.id ?? classItem.class_id ?? index}>
                <span className="list-marker" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span>
                  <strong>{classItem.title || classItem.name || classItem.course_name || classItem.code || "Class"}</strong>
                  <small>{classItem.description || classItem.course_code || "Open class details"}</small>
                </span>
                <span className="list-arrow" aria-hidden="true">↗</span>
              </li>
            ))}
          </ul>
        )}
        {role === "admin" && !loading && <p className="empty-state">Platform summary data will appear when administration endpoints are added to the API contract.</p>}
      </section>
    </>
  );
}

export default Dashboard;