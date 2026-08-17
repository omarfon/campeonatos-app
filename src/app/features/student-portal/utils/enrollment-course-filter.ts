import { StudentCourse } from '../models/student-portal.model';

export function filterEnrollmentCourses(courses: StudentCourse[], query: string): StudentCourse[] {
  const q = query.trim().toLowerCase();
  if (!q) return courses;
  return courses.filter(c =>
    c.name.toLowerCase().includes(q)
    || c.code.toLowerCase().includes(q)
    || c.discipline.toLowerCase().includes(q)
    || c.level.toLowerCase().includes(q)
    || c.modality.toLowerCase().includes(q)
    || c.campus.toLowerCase().includes(q)
    || (c.description?.toLowerCase().includes(q) ?? false),
  );
}
