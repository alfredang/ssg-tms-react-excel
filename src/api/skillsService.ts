import ssgClient from "./ssgClient";

/**
 * Skills Framework API Service
 *
 * Endpoints from SSG developer portal:
 * https://developer.ssg-wsg.gov.sg/webapp/docs/product/6Gl44K5M46EuDgn7LCsAs2/group/5uyNzClV5UJk6Uo0wDg7Mt
 */

/** GET /skillsFramework/occupations — List all occupations */
export const getOccupations = () => {
  return ssgClient.get("/skillsFramework/occupations");
};

/** GET /skillsFramework/{occupationId}/jobRoles — Get job roles for an occupation */
export const getJobRolesByOccupation = (occupationId: string) => {
  return ssgClient.get(
    `/skillsFramework/${encodeURIComponent(occupationId)}/jobRoles`
  );
};

/** GET /skillsFramework/jobRoles/details — Get detailed job role info */
export const getJobRoleDetails = (params: { id?: string; keyword?: string }) => {
  return ssgClient.get("/skillsFramework/jobRoles/details", { params });
};

/** GET /skillsFramework/jobRoles — Search job roles by keyword */
export const searchJobRoles = (keyword: string) => {
  return ssgClient.get("/skillsFramework/jobRoles", {
    params: { keyword },
  });
};

/** GET /skillsFramework/jobRoles/{jobRoleId}/related — Get related job roles */
export const getRelatedJobRoles = (jobRoleId: string) => {
  return ssgClient.get(
    `/skillsFramework/jobRoles/${encodeURIComponent(jobRoleId)}/related`
  );
};
