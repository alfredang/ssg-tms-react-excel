import ssgClient from "./ssgClient";
import type { TrainerInfo } from "../types";

/**
 * Trainer Management API Service
 *
 * API names from SSG developer portal:
 * - NCS_MySF_retrieveTrainers (GET)
 * - NCS_MySF_trainingProviderTrainer_Insert (POST)
 * - NCS_MySF_updateDeleteTrainer (POST)
 *
 * TODO: Verify exact endpoint paths from SSG developer portal when available.
 * Paths below are inferred from API naming conventions.
 */

/** GET /tp/trainers — Retrieve all trainers for a training provider */
export const getTrainers = (uen: string) => {
  return ssgClient.get("/tp/trainers", {
    params: { uen },
  });
};

/** POST /tp/trainers — Insert a new trainer */
export const addTrainer = (payload: { trainer: TrainerInfo; uen: string }) => {
  return ssgClient.post("/tp/trainers", payload);
};

/**
 * POST /tp/trainers/{trainerId} — Update trainer details
 * The action field in the payload distinguishes update from delete.
 */
export const updateTrainer = (
  trainerId: string,
  payload: { trainer: TrainerInfo; uen: string }
) => {
  return ssgClient.post(
    `/tp/trainers/${encodeURIComponent(trainerId)}`,
    payload
  );
};

/**
 * POST /tp/trainers/{trainerId} — Delete trainer
 * Uses the same endpoint as update but with action: "delete" in payload.
 */
export const deleteTrainer = (
  trainerId: string,
  payload: { action: "delete"; uen: string }
) => {
  return ssgClient.post(
    `/tp/trainers/${encodeURIComponent(trainerId)}`,
    payload
  );
};
