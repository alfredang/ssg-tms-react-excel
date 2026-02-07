import * as XLSX from "xlsx";
import type {
  SheetData,
  ColumnMapping,
  ValidationError,
  CourseSession,
  CourseRunInfo,
  CreateEnrolmentPayload,
} from "../types";

/**
 * Parse an Excel file and return all sheets as JSON data.
 */
export const parseExcelFile = async (
  file: File
): Promise<Record<string, unknown[]>> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });

  const result: Record<string, unknown[]> = {};

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];
    result[sheetName] = XLSX.utils.sheet_to_json(worksheet, {
      defval: "",
      raw: false,
    });
  }

  return result;
};

/**
 * Get sheet names from an Excel file.
 */
export const getSheetNames = async (file: File): Promise<string[]> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });
  return workbook.SheetNames;
};

/**
 * Parse a specific sheet using column mappings to produce typed objects.
 */
export const parseSheet = <T>(
  rows: Record<string, unknown>[],
  mappings: ColumnMapping[]
): SheetData<T> => {
  const errors: ValidationError[] = [];
  const mapped: T[] = [];

  rows.forEach((row, rowIndex) => {
    const obj: Record<string, unknown> = {};

    for (const mapping of mappings) {
      const rawValue = row[mapping.excelColumn];

      if (mapping.required && (rawValue === undefined || rawValue === "" || rawValue === null)) {
        errors.push({
          row: rowIndex + 2, // Excel rows are 1-indexed, plus header
          field: mapping.excelColumn,
          message: `Required field "${mapping.excelColumn}" is missing`,
        });
        continue;
      }

      if (rawValue !== undefined && rawValue !== "" && rawValue !== null) {
        obj[mapping.apiField] = mapping.transform
          ? mapping.transform(rawValue)
          : rawValue;
      }
    }

    mapped.push(obj as T);
  });

  return {
    sheetName: "",
    data: mapped,
    errors,
  };
};

// -------------------- Course Sessions Sheet --------------------

const courseSessionMappings: ColumnMapping[] = [
  { excelColumn: "Start Date", apiField: "startDate", required: true, transform: formatDateYYYYMMDD },
  { excelColumn: "End Date", apiField: "endDate", required: true, transform: formatDateYYYYMMDD },
  { excelColumn: "Start Time", apiField: "startTime", required: true, transform: formatTimeHHMM },
  { excelColumn: "End Time", apiField: "endTime", required: true, transform: formatTimeHHMM },
  { excelColumn: "Mode of Training", apiField: "modeOfTraining", required: true },
  { excelColumn: "Venue Block", apiField: "venue.block", required: false },
  { excelColumn: "Venue Street", apiField: "venue.street", required: false },
  { excelColumn: "Venue Floor", apiField: "venue.floor", required: false },
  { excelColumn: "Venue Unit", apiField: "venue.unit", required: false },
  { excelColumn: "Venue Building", apiField: "venue.building", required: false },
  { excelColumn: "Venue Postal Code", apiField: "venue.postalCode", required: false },
  { excelColumn: "Venue Room", apiField: "venue.room", required: false },
];

export const parseCourseSessionsSheet = (
  rows: Record<string, unknown>[]
): SheetData<CourseSession> => {
  const errors: ValidationError[] = [];
  const sessions: CourseSession[] = [];

  rows.forEach((row, rowIndex) => {
    const session: Partial<CourseSession> = {};
    const venue: Record<string, unknown> = {};

    for (const mapping of courseSessionMappings) {
      const rawValue = row[mapping.excelColumn];

      if (mapping.required && !rawValue) {
        errors.push({
          row: rowIndex + 2,
          field: mapping.excelColumn,
          message: `Required field "${mapping.excelColumn}" is missing`,
        });
      }

      const value = mapping.transform && rawValue ? mapping.transform(rawValue) : rawValue;

      if (mapping.apiField.startsWith("venue.")) {
        const venueField = mapping.apiField.replace("venue.", "");
        if (value) venue[venueField] = value;
      } else {
        (session as Record<string, unknown>)[mapping.apiField] = value;
      }
    }

    if (Object.keys(venue).length > 0) {
      session.venue = venue as CourseSession["venue"];
    }

    sessions.push(session as CourseSession);
  });

  return { sheetName: "Course Sessions", data: sessions, errors };
};

// -------------------- Course Runs Sheet --------------------

const courseRunMappings: ColumnMapping[] = [
  { excelColumn: "Course Reference Number", apiField: "courseReferenceNumber", required: true },
  { excelColumn: "Registration Opening Date", apiField: "registrationDates.opening", required: true, transform: formatDateYYYYMMDD },
  { excelColumn: "Registration Closing Date", apiField: "registrationDates.closing", required: true, transform: formatDateYYYYMMDD },
  { excelColumn: "Course Start Date", apiField: "courseDates.start", required: true, transform: formatDateYYYYMMDD },
  { excelColumn: "Course End Date", apiField: "courseDates.end", required: true, transform: formatDateYYYYMMDD },
  { excelColumn: "Schedule Info Type Code", apiField: "scheduleInfoType.code", required: true },
  { excelColumn: "Schedule Info Type Description", apiField: "scheduleInfoType.description", required: true },
  { excelColumn: "Schedule Info", apiField: "scheduleInfo", required: false },
  { excelColumn: "Mode of Training", apiField: "modeOfTraining", required: true },
  { excelColumn: "Course Admin Email", apiField: "courseAdminEmail", required: true },
  { excelColumn: "Intake Size", apiField: "intakeSize", required: false, transform: Number },
  { excelColumn: "Threshold", apiField: "threshold", required: false, transform: Number },
  { excelColumn: "Vacancy Code", apiField: "courseVacancy.code", required: true },
  { excelColumn: "Vacancy Description", apiField: "courseVacancy.description", required: true },
  { excelColumn: "Venue Block", apiField: "venue.block", required: false },
  { excelColumn: "Venue Street", apiField: "venue.street", required: false },
  { excelColumn: "Venue Floor", apiField: "venue.floor", required: false },
  { excelColumn: "Venue Unit", apiField: "venue.unit", required: false },
  { excelColumn: "Venue Building", apiField: "venue.building", required: false },
  { excelColumn: "Venue Postal Code", apiField: "venue.postalCode", required: false },
  { excelColumn: "Venue Room", apiField: "venue.room", required: false },
];

export const parseCourseRunsSheet = (
  rows: Record<string, unknown>[]
): SheetData<CourseRunInfo & { courseReferenceNumber: string }> => {
  const errors: ValidationError[] = [];
  const runs: Array<CourseRunInfo & { courseReferenceNumber: string }> = [];

  rows.forEach((row, rowIndex) => {
    const run: Record<string, unknown> = {};
    const venue: Record<string, unknown> = {};
    const registrationDates: Record<string, unknown> = {};
    const courseDates: Record<string, unknown> = {};
    const scheduleInfoType: Record<string, unknown> = {};
    const courseVacancy: Record<string, unknown> = {};

    for (const mapping of courseRunMappings) {
      const rawValue = row[mapping.excelColumn];

      if (mapping.required && !rawValue) {
        errors.push({
          row: rowIndex + 2,
          field: mapping.excelColumn,
          message: `Required field "${mapping.excelColumn}" is missing`,
        });
      }

      const value = mapping.transform && rawValue ? mapping.transform(rawValue) : rawValue;

      if (mapping.apiField.startsWith("venue.")) {
        if (value) venue[mapping.apiField.replace("venue.", "")] = value;
      } else if (mapping.apiField.startsWith("registrationDates.")) {
        registrationDates[mapping.apiField.replace("registrationDates.", "")] = value;
      } else if (mapping.apiField.startsWith("courseDates.")) {
        courseDates[mapping.apiField.replace("courseDates.", "")] = value;
      } else if (mapping.apiField.startsWith("scheduleInfoType.")) {
        scheduleInfoType[mapping.apiField.replace("scheduleInfoType.", "")] = value;
      } else if (mapping.apiField.startsWith("courseVacancy.")) {
        courseVacancy[mapping.apiField.replace("courseVacancy.", "")] = value;
      } else {
        run[mapping.apiField] = value;
      }
    }

    run.venue = venue;
    run.registrationDates = registrationDates;
    run.courseDates = courseDates;
    run.scheduleInfoType = scheduleInfoType;
    run.courseVacancy = courseVacancy;

    runs.push(run as unknown as CourseRunInfo & { courseReferenceNumber: string });
  });

  return { sheetName: "Course Runs", data: runs, errors };
};

// -------------------- Enrolments Sheet --------------------

const enrolmentMappings: ColumnMapping[] = [
  { excelColumn: "Course Run ID", apiField: "course.run.id", required: true },
  { excelColumn: "Course Reference Number", apiField: "course.referenceNumber", required: true },
  { excelColumn: "Trainee ID", apiField: "trainee.id", required: true },
  { excelColumn: "Trainee ID Type", apiField: "trainee.idType.code", required: true },
  { excelColumn: "Trainee Full Name", apiField: "trainee.fullName", required: true },
  { excelColumn: "Trainee Date of Birth", apiField: "trainee.dateOfBirth", required: true },
  { excelColumn: "Trainee Email", apiField: "trainee.emailAddress", required: false },
  { excelColumn: "Enrolment Date", apiField: "trainee.enrolmentDate", required: true },
  { excelColumn: "Sponsorship Type", apiField: "trainee.sponsorshipType", required: true },
  { excelColumn: "Area Code", apiField: "trainee.contactNumber.areaCode", required: false, transform: Number },
  { excelColumn: "Country Code", apiField: "trainee.contactNumber.countryCode", required: false, transform: Number },
  { excelColumn: "Phone Number", apiField: "trainee.contactNumber.phoneNumber", required: false },
  { excelColumn: "Discount Amount", apiField: "trainee.fees.discountAmount", required: false, transform: Number },
  { excelColumn: "Collection Status", apiField: "trainee.fees.collectionStatus", required: false },
  { excelColumn: "Employer UEN", apiField: "employer.uen", required: false },
  { excelColumn: "Employer Full Name", apiField: "employer.fullName", required: false },
  { excelColumn: "Employer Email", apiField: "employer.emailAddress", required: false },
  { excelColumn: "Training Partner Code", apiField: "trainingPartner.code", required: true },
  { excelColumn: "Training Partner UEN", apiField: "trainingPartner.uen", required: false },
];

export const parseEnrolmentsSheet = (
  rows: Record<string, unknown>[]
): SheetData<CreateEnrolmentPayload["enrolment"]> => {
  const errors: ValidationError[] = [];
  const enrolments: Array<CreateEnrolmentPayload["enrolment"]> = [];

  rows.forEach((row, rowIndex) => {
    const enrolment: Record<string, unknown> = {};

    for (const mapping of enrolmentMappings) {
      const rawValue = row[mapping.excelColumn];

      if (mapping.required && !rawValue) {
        errors.push({
          row: rowIndex + 2,
          field: mapping.excelColumn,
          message: `Required field "${mapping.excelColumn}" is missing`,
        });
      }

      const value = mapping.transform && rawValue ? mapping.transform(rawValue) : rawValue;
      if (value !== undefined && value !== "" && value !== null) {
        setNestedValue(enrolment, mapping.apiField, value);
      }
    }

    enrolments.push(enrolment as CreateEnrolmentPayload["enrolment"]);
  });

  return { sheetName: "Enrolments", data: enrolments, errors };
};

// -------------------- Helpers --------------------

function setNestedValue(obj: Record<string, unknown>, path: string, value: unknown) {
  const keys = path.split(".");
  let current = obj;

  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]] || typeof current[keys[i]] !== "object") {
      current[keys[i]] = {};
    }
    current = current[keys[i]] as Record<string, unknown>;
  }

  current[keys[keys.length - 1]] = value;
}

function formatDateYYYYMMDD(value: unknown): string {
  if (!value) return "";
  const str = String(value);

  // Handle various date formats
  const dateObj = new Date(str);
  if (!isNaN(dateObj.getTime())) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}${m}${d}`;
  }

  // If already in YYYYMMDD format
  if (/^\d{8}$/.test(str)) return str;

  return str;
}

function formatTimeHHMM(value: unknown): string {
  if (!value) return "";
  const str = String(value);

  // If already in HH:mm format
  if (/^\d{2}:\d{2}$/.test(str)) return str;

  // Handle various time formats
  const match = str.match(/(\d{1,2}):(\d{2})/);
  if (match) {
    return `${match[1].padStart(2, "0")}:${match[2]}`;
  }

  return str;
}
