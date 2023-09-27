import { IS_FORMBRICKS_CLOUD, RESPONSES_LIMIT_FREE } from "@formbricks/lib/constants";
import { getSurveyResponses } from "@formbricks/lib/services/response";
import { getSurveyWithAnalytics } from "@formbricks/lib/services/survey";
import { getTeamByEnvironmentId } from "@formbricks/lib/services/team";

export const getAnalysisData = async (surveyId: string, environmentId: string) => {
  const [survey, team, allResponses] = await Promise.all([
    getSurveyWithAnalytics(surveyId),
    getTeamByEnvironmentId(environmentId),
    getSurveyResponses(surveyId),
  ]);
  if (!survey) throw new Error(`Survey not found: ${surveyId}`);
  if (!team) throw new Error(`Team not found for environment: ${environmentId}`);
  if (survey.environmentId !== environmentId) throw new Error(`Survey not found: ${surveyId}`);
  const limitReached =
    IS_FORMBRICKS_CLOUD &&
    team.subscription?.plan === "community" &&
    survey.type === "web" &&
    allResponses.length >= RESPONSES_LIMIT_FREE;
  const responses = limitReached ? allResponses.slice(0, RESPONSES_LIMIT_FREE) : allResponses;
  const responsesCount = allResponses.length;

  return { responses, responsesCount, limitReached, survey };
};
