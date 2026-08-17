import { MemberActivity, MemberActivityFilters } from '../models/member-portal.model';
import { MemberScheduleAvailability } from '../enums/member-schedule-availability.enum';

export function filterMemberActivities(
  activities: MemberActivity[],
  filters: MemberActivityFilters,
  scheduleAvailabilityByActivity?: Map<number, MemberScheduleAvailability[]>,
): MemberActivity[] {
  let list = [...activities];
  const q = filters.query?.trim().toLowerCase();

  if (filters.discipline && filters.discipline !== 'all') {
    list = list.filter(a => a.discipline === filters.discipline);
  }
  if (filters.category && filters.category !== 'all') {
    list = list.filter(a => a.category === filters.category);
  }
  if (filters.modality && filters.modality !== 'all') {
    list = list.filter(a => a.modality === filters.modality);
  }
  if (filters.campus && filters.campus !== 'all') {
    list = list.filter(a => a.campus === filters.campus);
  }
  if (filters.availability && filters.availability !== 'all' && scheduleAvailabilityByActivity) {
    list = list.filter(a => {
      const statuses = scheduleAvailabilityByActivity.get(a.id) ?? [];
      if (filters.availability === MemberScheduleAvailability.FULL) {
        return statuses.length > 0 && statuses.every(s => s === MemberScheduleAvailability.FULL);
      }
      return statuses.includes(filters.availability as MemberScheduleAvailability);
    });
  }
  if (q) {
    list = list.filter(a =>
      a.name.toLowerCase().includes(q)
      || a.code.toLowerCase().includes(q)
      || a.discipline.toLowerCase().includes(q)
      || a.level.toLowerCase().includes(q)
      || a.description.toLowerCase().includes(q),
    );
  }
  return list;
}

export function filterSchedulesByDay<T extends { dayKeys: string[] }>(
  schedules: T[],
  day?: string,
): T[] {
  if (!day || day === 'all') return schedules;
  return schedules.filter(s => s.dayKeys.includes(day));
}
