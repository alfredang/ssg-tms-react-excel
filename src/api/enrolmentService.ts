import ssgClient from "./ssgClient";
import type {
  CreateEnrolmentPayload,
  UpdateEnrolmentPayload,
  CancelEnrolmentPayload,
  SearchEnrolmentPayload,
  UpdateFeeCollectionPayload,
} from "../types";

/**
 * Enrolment API Service
 *
 * Endpoints verified from SSG official Sample-Codes:
 * https://github.com/ssg-wsg/Sample-Codes/tree/master/SSG-API-Testing-Application-v2/app/core/enrolment
 */

/** POST /tpg/enrolments — Create a new enrolment */
export const createEnrolment = (payload: CreateEnrolmentPayload) => {
  return ssgClient.post("/tpg/enrolments", payload);
};

/** POST /tpg/enrolments/details/{refNum} — Update an existing enrolment */
export const updateEnrolment = (
  referenceNumber: string,
  payload: UpdateEnrolmentPayload
) => {
  return ssgClient.post(
    `/tpg/enrolments/details/${encodeURIComponent(referenceNumber)}`,
    payload
  );
};

/** POST /tpg/enrolments/details/{refNum} — Cancel an enrolment */
export const cancelEnrolment = (
  referenceNumber: string,
  payload: CancelEnrolmentPayload
) => {
  return ssgClient.post(
    `/tpg/enrolments/details/${encodeURIComponent(referenceNumber)}`,
    payload
  );
};

/** POST /tpg/enrolments/search — Search enrolments with filters */
export const searchEnrolment = (payload: SearchEnrolmentPayload) => {
  return ssgClient.post("/tpg/enrolments/search", payload);
};

/** GET /tpg/enrolments/details/{refNum} — View enrolment details */
export const viewEnrolment = (referenceNumber: string) => {
  return ssgClient.get(
    `/tpg/enrolments/details/${encodeURIComponent(referenceNumber)}`
  );
};

/** POST /tpg/enrolments/feeCollections/{refNum} — Update fee collection status */
export const updateFeeCollection = (
  referenceNumber: string,
  payload: UpdateFeeCollectionPayload
) => {
  return ssgClient.post(
    `/tpg/enrolments/feeCollections/${encodeURIComponent(referenceNumber)}`,
    payload
  );
};
