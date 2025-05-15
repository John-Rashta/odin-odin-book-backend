import { ValidationErrorItem } from "joi";

export function mapErrorDetails(details: ValidationErrorItem[]) {
  return details.map((item) => ({
    message: item.message,
    path: item.path,
    type: item.type,
  }));
}