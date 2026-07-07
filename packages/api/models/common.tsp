namespace AgentMail;

model ErrorResponse {
  error: string;
  message: string;
}

model PaginatedList<T> {
  items: T[];
  total: uint32;
  page: uint32;
  limit: uint32;
}
