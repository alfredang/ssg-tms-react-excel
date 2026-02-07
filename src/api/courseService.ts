import ssgClient from "./ssgClient";
import type {
  AddCourseRunPayload,
  EditCourseRunPayload,
  DeleteCourseRunPayload,
  CourseSessionsQueryParams,
} from "../types";

/**
 * Course Run & Session API Service
 *
 * Endpoints derived from SSG official Sample-Codes:
 * https://github.com/ssg-wsg/Sample-Codes/tree/master/SSG-API-Testing-Application-v2/app/core/courses
 */

/** GET /courses/courseRuns/id/{runId} */
export const getCourseRunById = (
  runId: string,
  includeExpired?: boolean
) => {
  return ssgClient.get(`/courses/courseRuns/id/${encodeURIComponent(runId)}`, {
    params: includeExpired !== undefined
      ? { includeExpiredCourses: String(includeExpired) }
      : undefined,
  });
};

/** POST /courses/courseRuns/publish */
export const publishCourseRun = (payload: AddCourseRunPayload) => {
  return ssgClient.post("/courses/courseRuns/publish", payload);
};

/** POST /courses/courseRuns/edit/{runId} — action: "update" */
export const editCourseRun = (
  runId: string,
  payload: EditCourseRunPayload
) => {
  return ssgClient.post(
    `/courses/courseRuns/edit/${encodeURIComponent(runId)}`,
    payload
  );
};

/** POST /courses/courseRuns/edit/{runId} — action: "delete" */
export const deleteCourseRun = (
  runId: string,
  payload: DeleteCourseRunPayload
) => {
  return ssgClient.post(
    `/courses/courseRuns/edit/${encodeURIComponent(runId)}`,
    payload
  );
};

/**
 * GET /courses/runs/{runId}/sessions
 *
 * Query params: uen, courseReferenceNumber, sessionMonth (MMYYYY), includeExpiredCourses
 */
export const getCourseSessions = (params: CourseSessionsQueryParams) => {
  const { runId, uen, courseReferenceNumber, sessionMonth, includeExpiredCourses } = params;

  const queryParams: Record<string, string> = {
    uen,
    courseReferenceNumber,
  };

  if (sessionMonth) {
    queryParams.sessionMonth = sessionMonth;
  }

  if (includeExpiredCourses !== undefined) {
    queryParams.includeExpiredCourses = String(includeExpiredCourses);
  }

  return ssgClient.get(`/courses/runs/${encodeURIComponent(runId)}/sessions`, {
    params: queryParams,
  });
};
