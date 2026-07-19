import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken"
import crypto from "crypto";
import { JWT_SECRET } from "../config";
import { UserRepository } from "../routes/repositories/auth/auth.respository";
import { UserInfo } from "node:os";
import { HttpError } from "../errors/http_error";
import { UserType } from "../types/auth/user.type";
import { IUser } from "../models/auth/user.models";


let userRepository = new UserRepository();
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
} // creating a tag for user 
// can use req.user after this

export async function authorizedMiddelWare(req: Request, res: Response, next: NextFunction) {
    // express function can have next function to go to next
    try{
        const authHeader = req.headers.authorization;
        if(!authHeader || !authHeader.startsWith("Bearer "))
            throw new HttpError( 401, "Unauthorized, No Bearer Token" );
        
        const token = authHeader.split(" ")[1]; // "Bearer <token>" 0 -> Bearer , 1 -> token
        if(!token)
            throw new HttpError( 401, "Unauthorized, Missing Token" );
        
        const decoded = jwt.verify(token, JWT_SECRET) as Record<string, any>; // decoded -> payload
        if(!decoded || !decoded.id)
            throw new HttpError( 401, "Unauthorized, Invalid Token" );

        // Session binding: verify user-agent fingerprint matches the one in JWT
        // This prevents stolen tokens from being used on different devices/browsers
        // DEV/TEST ONLY: set DISABLE_FINGERPRINT_CHECK=true in .env to bypass while pentesting
        // Must never be true in production.
        const fingerprintCheckDisabled = process.env.NODE_ENV !== 'production'
            && process.env.DISABLE_FINGERPRINT_CHECK === 'true';

        if (decoded.uaFp && !fingerprintCheckDisabled) {
            const currentUa = req.headers['user-agent'] || 'unknown';
            const currentFingerprint = crypto.createHash('sha256').update(currentUa).digest('hex').substring(0, 16);
            if (decoded.uaFp !== currentFingerprint) {
                throw new HttpError(401, "Session invalid: device mismatch detected. Please log in again.");
            }
        }

        const user = await userRepository.getUserById( decoded.id ); // make function async
        if(!user)
            throw new HttpError( 401, "Unauthorized, User Not Found" );

        req.user = user;
         next();
    }catch(err: Error | any){
        return res.status(err.statusCode || 500 ).json(
            { success: false, message: err.message || "Unauthorized" }
        )
    }
   
}
 export async function adminMiddelware(req: Request, res: Response, next: NextFunction) {
    try{
        // req.user is set in authorizedMiddelWare
        // only use role/admin middleware after user is authorized
        if(!req.user)
            throw new HttpError( 401, "Unauthorized, User Not Found" );
        
        if(req.user.role !== 'admin')
            throw new HttpError( 403, "Forbidden, Admins Only" );
        
        return next();
    }catch(err: Error | any){
        return res.status(err.statusCode || 500 ).json(
            { success: false, message: err.message || "Unauthorized" }
        )
    }
}