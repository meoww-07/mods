import { useEffect, useMemo, useState } from 'react';
import './styling/timetable.css'
import { weeklyTimetableMock } from '../MockData/WeeklyTimeTable';
import { useAuth } from '../context/Auth';

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const subjectColors = ["lime", "yellow", "teal", "coral", "purple", "orange"];

const formatSlot = (slot) =>
  slot
    .replace(/\s?AM|\s?PM/g, "")
    .replace(" - ", "\n-\n")
    .replace(/^0/, "");

const formatSeedTime = (time) => {
  const [hourValue, minuteValue] = String(time).split(":").map(Number);
  if (!Number.isFinite(hourValue) || !Number.isFinite(minuteValue)) return time;

  const meridiem = hourValue >= 12 ? "PM" : "AM";
  const hour = hourValue % 12 || 12;
  return `${String(hour).padStart(2, "0")}:${String(minuteValue).padStart(2, "0")} ${meridiem}`;
};

const getSubjectMap = (rows) => {
  const map = new Map();

  rows.forEach((row) => {
    if (row.isBreak) return;
    row.schedule.forEach((course) => {
      if (!course || map.has(course.courseCode)) return;
      map.set(course.courseCode, {
        ...course,
        color: subjectColors[map.size % subjectColors.length]
      });
    });
  });

  return map;
};

const normalizeCourse = (slot) => ({
  courseCode: slot.courseCode,
  courseName: slot.courseName || slot.rawText,
  facultyName: slot.facultyName,
  roomNo: slot.roomNo
});

const buildRowsFromSchedules = (schedules) => {
  const timeSlots = [
    ...new Map(
      schedules
        .slice()
        .sort((a, b) => a.startMinutes - b.startMinutes)
        .map((slot) => [`${slot.startTime}-${slot.endTime}`, slot])
    ).values()
  ];

  return timeSlots.map((slot) => ({
    timeSlot: `${formatSeedTime(slot.startTime)} - ${formatSeedTime(slot.endTime)}`,
    isBreak: false,
    schedule: dayKeys.map((day) => {
      const match = schedules.find(
        (item) => item.dayOfWeek === day && item.startTime === slot.startTime && item.endTime === slot.endTime
      );
      return match ? normalizeCourse(match) : null;
    })
  }));
};

export default function TimeTable(props) {
  const { user } = useAuth();
  const [seedSchedules, setSeedSchedules] = useState([]);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetch("/timetableSeed.json")
      .then((response) => {
        if (!response.ok) throw new Error("Timetable seed not found");
        return response.json();
      })
      .then((seed) => {
        setSeedSchedules(seed.schedules || []);
        setLoadError("");
      })
      .catch(() => {
        setSeedSchedules([]);
        setLoadError("Unable to load imported timetable data.");
      });
  }, []);

  const profileSchedules = useMemo(() => {
    if (!user?.batch || !user?.semester) return [];

    return seedSchedules.filter((slot) => slot.batch === user.batch && slot.semester === user.semester && !slot.isCancelled);
  }, [seedSchedules, user?.batch, user?.semester]);

  const data = profileSchedules.length ? buildRowsFromSchedules(profileSchedules) : !user ? weeklyTimetableMock : [];
  const subjectMap = getSubjectMap(data);
  const section = user ? `${user.batch} · ${user.semester}` : "Sample CSE timetable";

  return (
    <section className="schedule-page" style={{ "--day-count": days.length }}>
      <header className="schedule-hero">
        <div>
          <h1>Weekly Timetable</h1>
          <p>Academic Year {props.year} · {section}</p>
        </div>
      </header>

      {user && loadError && <p className="schedule-empty">{loadError}</p>}
      {user && !loadError && seedSchedules.length > 0 && data.length === 0 && (
        <p className="schedule-empty">No imported timetable is available for {user.batch} {user.semester} yet.</p>
      )}

      {data.length > 0 && (
        <div className="schedule-layout">
          <div className="schedule-grid-wrap">
            <div className="schedule-grid--days">
              <div />
              {days.map((day) => (
                <div className="day-heading" key={day}>{day}</div>
              ))}
            </div>

            <div className="schedule-rows">
              {data.map((row) => {
                if (row.isBreak) {
                  return (
                    <div className="banner-row" key={row.timeSlot}>
                      {row.label}
                    </div>
                  );
                }

                return (
                  <div className="schedule-row-grid" key={row.timeSlot}>
                    <div className="time-cell">{formatSlot(row.timeSlot)}</div>
                    {row.schedule.map((course, index) => {
                      if (!course) {
                        return <div className="empty-cell" key={`${row.timeSlot}-${days[index]}`} />;
                      }

                      const color = subjectMap.get(course.courseCode)?.color || "lime";
                      return (
                        <article className={`course-block block--${color}`} key={`${row.timeSlot}-${days[index]}-${course.courseCode}`}>
                          <h3>{course.courseCode}</h3>
                          <p className="course-title">{course.courseName}</p>
                          <p className="course-faculty">{course.facultyName}</p>
                          <strong>{course.roomNo}</strong>
                        </article>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="schedule-sidebar">
            <section className="sidebar-panel">
              <h2>Subjects</h2>
              <div className="legend-list">
                {[...subjectMap.entries()].map(([code, course]) => (
                  <div className="legend-item" key={code}>
                    <span className={`legend-swatch block--${course.color}`} />
                    <p><strong>{code}</strong> · {course.courseName}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="note-panel">
              <h2>Note:</h2>
              <p>Lab sessions run in CSE LAB 2/3 and ECE LAB 3. Lecture rooms are CR 5 and CR 6.</p>
            </section>
          </aside>
        </div>
      )}
    </section>
  )
}
