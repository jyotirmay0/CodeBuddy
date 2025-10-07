export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface ApiEndpoint {
  id: string;
  category: string;
  method: HttpMethod;
  url: string;
  description: string;
  requiresAuth: boolean;
  requiresBody: boolean;
  requiresParams: boolean;
  requiresFiles: boolean;
  bodyFields?: BodyField[];
}

export interface BodyField {
  name: string;
  type: "text" | "email" | "password" | "file" | "array" | "number" | "textarea";
  required: boolean;
  placeholder?: string;
}

export interface ApiResponse {
  status: number;
  data: any;
  timestamp: number;
}
