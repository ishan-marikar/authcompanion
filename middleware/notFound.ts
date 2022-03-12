import { Response } from "../deps.ts";

export const notFound = ({ response }: { response: Response }) => {
  response.status = 404;
  response.body = {
    errors: [{
      title: "Path not found",
      detail: "Not Found",
    }],
  };
};
