import { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";

declare global {
  namespace Express {
    interface Request {
      user: JwtPayload & { userId: Types.ObjectId };
    }
  }
}
