import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import {
  EnrollmentRule,
  EnrollmentRuleResult,
  EnrollmentValidationResult,
} from '../models/enrollment.model';
import { EnrollmentRuleType } from '../enums/enrollment-rule-type.enum';
import {
  MOCK_ENROLLMENT_CLASSES,
  MOCK_ENROLLMENT_RULES,
  MOCK_ENROLLMENT_STUDENTS,
  MOCK_ENROLLMENTS,
} from '../mocks/enrollment.mock';
import { ClassStatus } from '../enums/class-status.enum';
import { EnrollmentStatus } from '../enums/enrollment-status.enum';

@Injectable({ providedIn: 'root' })
export class EnrollmentRuleService {
  getRules(): Observable<EnrollmentRule[]> {
    return of([...MOCK_ENROLLMENT_RULES]).pipe(delay(150));
  }

  validateEnrollmentRules(studentId: number, courseId?: number): Observable<EnrollmentValidationResult> {
    const student = MOCK_ENROLLMENT_STUDENTS.find(s => s.id === studentId);
    const results: EnrollmentRuleResult[] = [];

    results.push({
      ruleId: 1,
      ruleName: 'Estudiante liquidado',
      status: student ? (this.hasPendingDebt(student.id) ? 'FAILED' : 'PASSED') : 'FAILED',
      message: student
        ? (this.hasPendingDebt(student.id)
          ? 'El estudiante tiene deudas pendientes de matrículas anteriores'
          : 'Estudiante al día — sin deudas pendientes')
        : 'Estudiante no identificado',
      blocking: student ? this.hasPendingDebt(student.id) : true,
    });

    results.push({
      ruleId: 3,
      ruleName: 'Estado del estudiante',
      status: student?.status === 'active' ? 'PASSED' : 'FAILED',
      message: student?.status === 'active' ? 'Estudiante activo' : 'Estudiante no activo',
      blocking: student?.status !== 'active',
    });

    results.push({
      ruleId: 3,
      ruleName: 'Condición académica',
      status: student?.condition === 'Activo' ? 'PASSED' : 'FAILED',
      message: student?.condition === 'Activo' ? 'Condición válida' : 'Condición inválida',
      blocking: student?.condition !== 'Activo',
    });

    if (courseId === 2 || courseId === 3) {
      const hasBasic = student?.isRegularStudent ?? false;
      results.push({
        ruleId: 5,
        ruleName: 'Requisito obligatorio',
        status: hasBasic ? 'PASSED' : 'FAILED',
        message: hasBasic
          ? 'Requisitos académicos cumplidos'
          : 'No cumple requisito previo (curso básico)',
        blocking: !hasBasic,
      });
    } else {
      results.push({
        ruleId: 5,
        ruleName: 'Curso habilitado',
        status: 'PASSED',
        message: 'Curso habilitado para matrícula',
        blocking: false,
      });
    }

    results.push({
      ruleId: 6,
      ruleName: 'Validación especial',
      status: 'WARNING',
      message: 'Certificado médico recomendado para natación',
      blocking: false,
    });

    results.push({
      ruleId: 3,
      ruleName: 'Matrícula permitida',
      status: 'PASSED',
      message: 'Puede continuar',
      blocking: false,
    });

    const blockingErrors = results.filter(r => r.status === 'FAILED' && r.blocking).length;
    const warnings = results.filter(r => r.status === 'WARNING').length;

    return of({
      valid: blockingErrors === 0,
      results,
      blockingErrors,
      warnings,
    }).pipe(delay(500));
  }

  validateClassApproved(classId: number): EnrollmentRuleResult {
    const cls = MOCK_ENROLLMENT_CLASSES.find(c => c.id === classId);
    const approved = cls?.status === ClassStatus.APPROVED;
    return {
      ruleId: 4,
      ruleName: 'Clase aprobada',
      status: approved ? 'PASSED' : 'FAILED',
      message: approved ? 'Clase aprobada y disponible' : 'La clase no está aprobada para matrícula',
      blocking: !approved,
    };
  }

  getRuleTypeLabel(type: EnrollmentRuleType): string {
    const labels: Record<EnrollmentRuleType, string> = {
      [EnrollmentRuleType.STUDENT_STATUS]: 'Estado estudiante',
      [EnrollmentRuleType.ACADEMIC_REQUIREMENT]: 'Requisito académico',
      [EnrollmentRuleType.AGREEMENT]: 'Convenio',
      [EnrollmentRuleType.CLASS_AVAILABILITY]: 'Disponibilidad',
      [EnrollmentRuleType.CUSTOM]: 'Personalizada',
    };
    return labels[type];
  }

  private hasPendingDebt(studentId: number): boolean {
    return MOCK_ENROLLMENTS.some(
      e => e.studentId === studentId && e.status === EnrollmentStatus.PENDING_PAYMENT,
    );
  }
}
