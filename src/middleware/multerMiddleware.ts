import multer from "multer";
import { Request, Response, NextFunction } from "express";
import { createApiResponse } from "../utils/apiResponse";

export function handleUploadError(err: unknown, _req: Request, res: Response, next: NextFunction) {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json(createApiResponse(false, null, 'File too large. Maximum size is 100MB.'));
    }
    return res.status(400).json(createApiResponse(false, null, `Upload error: ${err.message}`));
  }

  if (err instanceof Error) {
    return res.status(400).json(createApiResponse(false, null, err.message));
  }

  next(err);
}