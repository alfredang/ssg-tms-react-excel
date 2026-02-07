import ssgClient from "./ssgClient";
import type {
  CreateAssessmentPayload,
  UpdateVoidAssessmentPayload,
  SearchAssessmentPayload,
} from "../types";

/**
 * Assessment API Service
 *
 * Endpoints verified from SSG official Sample-Codes:
 * https://github.com/ssg-wsg/Sample-Codes/tree/master/SSG-API-Testing-Application-v2/app/core/assessments
 */

/** POST /tpg/assessments — Create a new assessment */
export const createAssessment = (payload: CreateAssessmentPayload) => {
  return ssgClient.post("/tpg/assessments", payload);
};

/** POST /tpg/assessments/details/{refNum} — Update an assessment */
export const updateAssessment = (
  referenceNumber: string,
  payload: UpdateVoidAssessmentPayload
) => {
  return ssgClient.post(
    `/tpg/assessments/details/${encodeURIComponent(referenceNumber)}`,
    { ...payload, assessment: { ...payload.assessment, action: "update" } }
  );
};

/** POST /tpg/assessments/details/{refNum} — Void an assessment */
export const voidAssessment = (
  referenceNumber: string,
  payload: UpdateVoidAssessmentPayload
) => {
  return ssgClient.post(
    `/tpg/assessments/details/${encodeURIComponent(referenceNumber)}`,
    { ...payload, assessment: { ...payload.assessment, action: "void" } }
  );
};

/** POST /tpg/assessments/search — Search assessments with filters */
export const searchAssessment = (payload: SearchAssessmentPayload) => {
  return ssgClient.post("/tpg/assessments/search", payload);
};

/** GET /tpg/assessments/details/{refNum} — View assessment details */
export const viewAssessment = (referenceNumber: string) => {
  return ssgClient.get(
    `/tpg/assessments/details/${encodeURIComponent(referenceNumber)}`
  );
};
