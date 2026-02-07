import type {
  ValidationResult,
  ValidationError,
  CourseRunInfo,
  CreateEnrolmentPayload,
  CreateAssessmentPayload,
} from "../types";

/**
 * Validators for SSG API payloads.
 * Validates required fields and data formats per SSG schema requirements.
 */

export const validateCourseRun = (
  data: Partial<CourseRunInfo> & { courseReferenceNumber?: string },
  index?: number
): ValidationResult => {
  const errors: ValidationError[] = [];
  const row = index !== undefined ? index + 1 : undefined;

  if (!data.courseReferenceNumber) {
    errors.push({ row, field: "courseReferenceNumber", message: "Course Reference Number is required" });
  }

  if (!data.registrationDates?.opening) {
    errors.push({ row, field: "registrationDates.opening", message: "Registration opening date is required" });
  }

  if (!data.registrationDates?.closing) {
    errors.push({ row, field: "registrationDates.closing", message: "Registration closing date is required" });
  }

  if (!data.courseDates?.start) {
    errors.push({ row, field: "courseDates.start", message: "Course start date is required" });
  }

  if (!data.courseDates?.end) {
    errors.push({ row, field: "courseDates.end", message: "Course end date is required" });
  }

  if (!data.modeOfTraining) {
    errors.push({ row, field: "modeOfTraining", message: "Mode of Training is required" });
  }

  if (!data.courseAdminEmail) {
    errors.push({ row, field: "courseAdminEmail", message: "Course Admin Email is required" });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.courseAdminEmail)) {
    errors.push({ row, field: "courseAdminEmail", message: "Invalid email format" });
  }

  if (!data.scheduleInfoType?.code) {
    errors.push({ row, field: "scheduleInfoType.code", message: "Schedule Info Type is required" });
  }

  if (!data.courseVacancy?.code) {
    errors.push({ row, field: "courseVacancy.code", message: "Course Vacancy code is required" });
  }

  // Validate date ordering
  if (data.registrationDates?.opening && data.registrationDates?.closing) {
    if (data.registrationDates.opening > data.registrationDates.closing) {
      errors.push({ row, field: "registrationDates", message: "Registration opening date must be before closing date" });
    }
  }

  if (data.courseDates?.start && data.courseDates?.end) {
    if (data.courseDates.start > data.courseDates.end) {
      errors.push({ row, field: "courseDates", message: "Course start date must be before end date" });
    }
  }

  return { valid: errors.length === 0, errors };
};

export const validateEnrolment = (
  data: Partial<CreateEnrolmentPayload["enrolment"]>,
  index?: number
): ValidationResult => {
  const errors: ValidationError[] = [];
  const row = index !== undefined ? index + 1 : undefined;

  if (!data.course?.run?.id) {
    errors.push({ row, field: "course.run.id", message: "Course Run ID is required" });
  }

  if (!data.course?.referenceNumber) {
    errors.push({ row, field: "course.referenceNumber", message: "Course Reference Number is required" });
  }

  if (!data.trainee?.id) {
    errors.push({ row, field: "trainee.id", message: "Trainee ID is required" });
  }

  if (!data.trainee?.idType?.code) {
    errors.push({ row, field: "trainee.idType.code", message: "Trainee ID Type is required" });
  }

  if (!data.trainee?.fullName) {
    errors.push({ row, field: "trainee.fullName", message: "Trainee Full Name is required" });
  }

  if (!data.trainee?.dateOfBirth) {
    errors.push({ row, field: "trainee.dateOfBirth", message: "Trainee Date of Birth is required" });
  }

  if (!data.trainee?.enrolmentDate) {
    errors.push({ row, field: "trainee.enrolmentDate", message: "Enrolment Date is required" });
  }

  if (!data.trainee?.sponsorshipType) {
    errors.push({ row, field: "trainee.sponsorshipType", message: "Sponsorship Type is required" });
  }

  if (!data.trainingPartner?.code) {
    errors.push({ row, field: "trainingPartner.code", message: "Training Partner Code is required" });
  }

  // Validate email format if provided
  if (data.trainee?.emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.trainee.emailAddress)) {
    errors.push({ row, field: "trainee.emailAddress", message: "Invalid email format" });
  }

  return { valid: errors.length === 0, errors };
};

export const validateAssessment = (
  data: Partial<CreateAssessmentPayload["assessment"]>,
  index?: number
): ValidationResult => {
  const errors: ValidationError[] = [];
  const row = index !== undefined ? index + 1 : undefined;

  if (!data.course?.runId) {
    errors.push({ row, field: "course.runId", message: "Course Run ID is required" });
  }

  if (!data.course?.referenceNumber) {
    errors.push({ row, field: "course.referenceNumber", message: "Course Reference Number is required" });
  }

  if (!data.result) {
    errors.push({ row, field: "result", message: "Result is required" });
  }

  if (!data.assessmentDate) {
    errors.push({ row, field: "assessmentDate", message: "Assessment Date is required" });
  }

  if (!data.trainee?.id) {
    errors.push({ row, field: "trainee.id", message: "Trainee ID is required" });
  }

  if (!data.trainee?.idType?.code) {
    errors.push({ row, field: "trainee.idType.code", message: "Trainee ID Type is required" });
  }

  if (!data.trainee?.fullName) {
    errors.push({ row, field: "trainee.fullName", message: "Trainee Full Name is required" });
  }

  if (!data.trainingPartner?.code) {
    errors.push({ row, field: "trainingPartner.code", message: "Training Partner Code is required" });
  }

  // Validate score range if provided
  if (data.score !== undefined && (data.score < 0 || data.score > 999)) {
    errors.push({ row, field: "score", message: "Score must be between 0 and 999" });
  }

  return { valid: errors.length === 0, errors };
};

/**
 * Validate UEN (Unique Entity Number) format.
 * Singapore UEN format: 9 or 10 characters alphanumeric
 */
export const validateUEN = (uen: string): boolean => {
  return /^[A-Za-z0-9]{9,10}$/.test(uen);
};
