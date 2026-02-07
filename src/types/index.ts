// ============================================================
// SSG API Type Definitions
// Derived from official SSG Sample-Codes repository:
// https://github.com/ssg-wsg/Sample-Codes
// ============================================================

// -------------------- Common Enums --------------------

export enum ModeOfTraining {
  CLASSROOM = "1",
  ASYNCHRONOUS_ELEARNING = "2",
  IN_HOUSE = "3",
  ON_THE_JOB = "4",
  PRACTICAL_PRACTICUM = "5",
  SUPERVISED_FIELD = "6",
  TRAINEESHIP = "7",
  ASSESSMENT = "8",
  SYNCHRONOUS_ELEARNING = "9",
}

export const ModeOfTrainingLabels: Record<ModeOfTraining, string> = {
  [ModeOfTraining.CLASSROOM]: "Classroom",
  [ModeOfTraining.ASYNCHRONOUS_ELEARNING]: "Asynchronous E-Learning",
  [ModeOfTraining.IN_HOUSE]: "In-house",
  [ModeOfTraining.ON_THE_JOB]: "On-the-Job",
  [ModeOfTraining.PRACTICAL_PRACTICUM]: "Practical / Practicum",
  [ModeOfTraining.SUPERVISED_FIELD]: "Supervised Field",
  [ModeOfTraining.TRAINEESHIP]: "Traineeship",
  [ModeOfTraining.ASSESSMENT]: "Assessment",
  [ModeOfTraining.SYNCHRONOUS_ELEARNING]: "Synchronous E-Learning",
};

export enum IdType {
  NRIC = "SB",
  FIN = "SO",
  OTHERS = "OT",
}

export const IdTypeLabels: Record<IdType, string> = {
  [IdType.NRIC]: "Singapore Blue IC",
  [IdType.FIN]: "FIN/Work Permit",
  [IdType.OTHERS]: "Others",
};

export enum CollectionStatus {
  PENDING_PAYMENT = "Pending Payment",
  PARTIAL_PAYMENT = "Partial Payment",
  FULL_PAYMENT = "Full Payment",
}

export enum SponsorshipType {
  EMPLOYER = "EMPLOYER",
  INDIVIDUAL = "INDIVIDUAL",
}

export enum Vacancy {
  AVAILABLE = "A",
  FULL = "F",
  LIMITED = "L",
}

export const VacancyLabels: Record<Vacancy, string> = {
  [Vacancy.AVAILABLE]: "Available",
  [Vacancy.FULL]: "Full",
  [Vacancy.LIMITED]: "Limited Vacancy",
};

export enum Grade {
  A = "A",
  B = "B",
  C = "C",
  D = "D",
  E = "E",
  F = "F",
}

export enum Results {
  PASS = "Pass",
  FAIL = "Fail",
  EXEMPT = "Exempt",
}

export enum SortField {
  UPDATED_ON = "updatedOn",
  CREATED_ON = "createdOn",
}

export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export enum AssessmentAction {
  UPDATE = "update",
  VOID = "void",
}

export enum Salutation {
  MR = "1",
  MS = "2",
  MDM = "3",
  MRS = "4",
  DR = "5",
  PROF = "6",
}

export const SalutationLabels: Record<Salutation, string> = {
  [Salutation.MR]: "Mr",
  [Salutation.MS]: "Ms",
  [Salutation.MDM]: "Mdm",
  [Salutation.MRS]: "Mrs",
  [Salutation.DR]: "Dr",
  [Salutation.PROF]: "Prof",
};

export enum TrainerType {
  EXISTING = "1",
  NEW = "2",
}

export const TrainerTypeLabels: Record<TrainerType, string> = {
  [TrainerType.EXISTING]: "Existing",
  [TrainerType.NEW]: "New",
};

export enum Role {
  TRAINER = "1",
  ASSESSOR = "2",
  TRAINER_ASSESSOR = "3",
}

export const RoleLabels: Record<Role, string> = {
  [Role.TRAINER]: "Trainer",
  [Role.ASSESSOR]: "Assessor",
  [Role.TRAINER_ASSESSOR]: "Trainer & Assessor",
};

export enum Attendance {
  CONFIRMED = "1",
  UNCONFIRMED = "2",
  REJECTED = "3",
}

export enum SurveyLanguage {
  ENGLISH = "EL",
  MANDARIN = "MN",
  MALAY = "MY",
  TAMIL = "TM",
}

// -------------------- Shared Types --------------------

export interface CodeDescription {
  code: string;
  description: string;
}

export interface Venue {
  block?: string;
  street?: string;
  floor?: string;
  unit?: string;
  building?: string;
  postalCode?: string;
  room?: string;
  wheelChairAccess?: boolean;
  primaryVenue?: boolean;
}

export interface ContactNumber {
  areaCode?: number;
  countryCode?: number;
  phoneNumber?: string;
}

export interface LinkedSSECEQA {
  description: string;
  ssecEQA: string;
}

// -------------------- Course Session Types --------------------

export interface CourseSession {
  sessionId?: string;
  startDate: string; // YYYYMMDD
  endDate: string; // YYYYMMDD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  modeOfTraining: string;
  venue?: Venue;
}

export interface CourseSessionsQueryParams {
  uen: string;
  courseReferenceNumber: string;
  runId: string;
  sessionMonth?: string; // MMYYYY
  includeExpiredCourses?: boolean;
}

// -------------------- Course Run Types --------------------

export interface CourseRunTrainer {
  trainerType: CodeDescription;
  indexNumber?: number;
  id: string;
  name: string;
  email?: string;
  idNumber: string;
  idType: CodeDescription;
  roles: Array<{ role: CodeDescription }>;
  inTrainingProviderProfile?: boolean;
  domainAreaOfPractice?: string;
  experience?: string;
  linkedInURL?: string;
  salutationId?: string;
  photo?: {
    name?: string;
    content?: string; // base64
  };
  linkedSsecEQAs?: LinkedSSECEQA[];
}

export interface CourseRunInfo {
  sequenceNumber?: number;
  registrationDates: {
    opening: string; // YYYYMMDD
    closing: string; // YYYYMMDD
  };
  courseDates: {
    start: string; // YYYYMMDD
    end: string; // YYYYMMDD
  };
  scheduleInfoType: CodeDescription;
  scheduleInfo?: string;
  venue: Venue;
  intakeSize?: number;
  threshold?: number;
  registeredUserCount?: number;
  modeOfTraining: string;
  courseAdminEmail: string;
  courseVacancy: CodeDescription;
  file?: {
    name?: string;
    content?: string; // base64
  };
  sessions?: CourseSession[];
  linkCourseRunTrainer?: CourseRunTrainer[];
}

export interface AddCourseRunPayload {
  course: {
    courseReferenceNumber: string;
    trainingProvider: { uen: string };
    runs: CourseRunInfo[];
  };
}

export interface EditCourseRunPayload {
  course: {
    courseReferenceNumber: string;
    trainingProvider: { uen: string };
    run: CourseRunInfo & { action: "update" };
  };
}

export interface DeleteCourseRunPayload {
  course: {
    courseReferenceNumber: string;
    trainingProvider: { uen: string };
    run: { action: "delete" };
  };
}

// -------------------- Trainer Types --------------------

export interface TrainerInfo {
  id?: string;
  name: string;
  email?: string;
  idNumber: string;
  idType: CodeDescription;
  roles: Array<{ role: CodeDescription }>;
  inTrainingProviderProfile?: boolean;
  domainAreaOfPractice?: string;
  experience?: string;
  linkedInURL?: string;
  salutationId?: string;
  photo?: {
    name?: string;
    content?: string;
  };
  linkedSsecEQAs?: LinkedSSECEQA[];
  trainerType: CodeDescription;
}

// -------------------- Enrolment Types --------------------

export interface CreateEnrolmentPayload {
  enrolment: {
    course: {
      run: { id: string };
      referenceNumber: string;
    };
    trainee: {
      id: string;
      idType: CodeDescription;
      fullName: string;
      dateOfBirth: string;
      emailAddress?: string;
      enrolmentDate: string;
      sponsorshipType: string;
      contactNumber?: ContactNumber;
      fees?: {
        discountAmount?: number;
        collectionStatus?: string;
      };
    };
    employer?: {
      uen?: string;
      fullName?: string;
      emailAddress?: string;
      areaCode?: number;
      countryCode?: number;
      phoneNumber?: string;
    };
    trainingPartner: {
      code: string;
      uen?: string;
    };
  };
}

export interface UpdateEnrolmentPayload {
  enrolment: {
    action: "Update";
    course?: {
      run?: { id: string };
    };
    trainee?: {
      emailAddress?: string;
      contactNumber?: ContactNumber;
      fees?: {
        discountAmount?: number;
        collectionStatus?: string;
      };
    };
  };
}

export interface CancelEnrolmentPayload {
  enrolment: {
    action: "Cancel";
    course?: {
      run?: { id: string };
    };
  };
}

export interface SearchEnrolmentPayload {
  meta: {
    lastUpdateDateTo?: string;
    lastUpdateDateFrom?: string;
  };
  sortBy?: {
    field: string;
    order: string;
  };
  parameters: {
    page: number;
    pageSize: number;
  };
  enrolment?: {
    course?: {
      run?: { id?: string };
      referenceNumber?: string;
    };
    trainee?: {
      id?: string;
      fees?: {
        feeCollectionStatus?: string;
      };
    };
    employer?: {
      uen?: string;
    };
    trainingPartner?: {
      uen?: string;
      code?: string;
    };
  };
}

export interface UpdateFeeCollectionPayload {
  enrolment: {
    fees: {
      collectionStatus: string;
    };
  };
}

export interface EnrolmentRecord {
  referenceNumber: string;
  status: string;
  course: {
    run: { id: string };
    referenceNumber: string;
  };
  trainee: {
    id: string;
    fullName: string;
    emailAddress?: string;
    fees?: {
      discountAmount?: number;
      collectionStatus?: string;
    };
  };
  trainingPartner: {
    code: string;
    uen?: string;
  };
  employer?: {
    uen?: string;
    fullName?: string;
  };
}

// -------------------- Assessment Types --------------------

export interface CreateAssessmentPayload {
  assessment: {
    course: {
      runId: string;
      referenceNumber: string;
    };
    result: string;
    grade?: string;
    score?: number;
    assessmentDate: string; // YYYY-MM-DD
    skillCode?: string;
    trainee: {
      id: string;
      idType: CodeDescription;
      fullName: string;
    };
    trainingPartner: {
      code: string;
      uen?: string;
    };
    conferringInstitute?: {
      code: string;
    };
  };
}

export interface UpdateVoidAssessmentPayload {
  assessment: {
    action: "update" | "void";
    result?: string;
    grade?: string;
    score?: number;
    assessmentDate?: string;
    skillCode?: string;
    trainee?: {
      fullName?: string;
    };
  };
}

export interface SearchAssessmentPayload {
  meta: {
    lastUpdateDateTo?: string;
    lastUpdateDateFrom?: string;
  };
  sortBy?: {
    field: string;
    order: string;
  };
  parameters: {
    page: number;
    pageSize: number;
  };
  assessment?: {
    course?: {
      runId?: string;
      referenceNumber?: string;
    };
    trainee?: {
      id?: string;
    };
    skillCode?: string;
    trainingPartner?: {
      uen?: string;
      code?: string;
    };
  };
}

export interface AssessmentRecord {
  referenceNumber: string;
  course: {
    runId: string;
    referenceNumber: string;
  };
  result: string;
  grade?: string;
  score?: number;
  assessmentDate: string;
  trainee: {
    id: string;
    fullName: string;
  };
  trainingPartner: {
    code: string;
    uen?: string;
  };
  skillCode?: string;
}

// -------------------- Skills Framework Types --------------------

export interface Occupation {
  id: string;
  name: string;
  sector?: string;
}

export interface JobRole {
  id: string;
  title: string;
  description?: string;
  sector?: string;
  occupation?: string;
  skills?: Skill[];
}

export interface Skill {
  id: string;
  name: string;
  description?: string;
  category?: string;
  proficiencyLevel?: string;
}

// -------------------- Validation Types --------------------

export interface ValidationError {
  row?: number;
  field: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// -------------------- Excel Mapping Types --------------------

export interface ColumnMapping {
  excelColumn: string;
  apiField: string;
  required: boolean;
  transform?: (value: unknown) => unknown;
}

export interface SheetData<T = Record<string, unknown>> {
  sheetName: string;
  data: T[];
  errors: ValidationError[];
}
