export function projectActionStatusMessage(
  status: string | undefined,
  fallback: string,
): string {
  switch (status) {
    case "row-version-conflict":
      return "This Project changed elsewhere. Refresh the page and try again.";
    case "invalid-request":
      return "Check the Project fields and try again.";
    case "invalid-member":
      return "That person is no longer eligible for this Project.";
    case "required-role":
      return "Reassign the required Project authority before removing access.";
    case "invalid-state":
      return "This action is not available in the current Project lifecycle.";
    case "publication-requirements-missing":
      return "Complete the Project publication requirements before publishing.";
    case "milestone-sequence-invalid":
      return "The Milestone sequence changed. Refresh and try the reorder again.";
    case "milestone-sequence-blocked":
      return "Published Milestone order can only be changed by the Project manager.";
    case "milestone-completion-blocked":
      return "This Milestone still has incomplete delivery requirements.";
    case "active-milestone-exists":
      return "Complete or cancel the current Active Milestone before activating another.";
    case "active-milestone-required":
      return "An Active Milestone is required for this Project transition.";
    case "milestone-not-found":
      return "This Milestone is no longer available.";
    case "client-organization-unavailable":
      return "That Client Organization is no longer available for this Project.";
    case "idempotency-conflict":
      return "This action was already submitted with different details. Refresh and try again.";
    case "project-not-found":
      return "This Project is no longer available.";
    case "delete-not-eligible":
      return "This Draft can no longer be deleted safely.";
    case "forbidden":
      return "You no longer have permission to make this change.";
    case "authentication-required":
      return "Your session needs to be renewed before this change can be saved.";
    case "service-error":
      return "The change could not be completed. Try again.";
    default:
      return status ?? fallback;
  }
}
