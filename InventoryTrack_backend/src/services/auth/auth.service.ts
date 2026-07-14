import { RegisterDTO, LoginDto, UpdateUserDto, AdminLoginDTO } from "../../dtos/auth/user.dto";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config";
import { HttpError } from "../../errors/http_error";
import { UserRepository } from "../../routes/repositories/auth/auth.respository";

let userRepository = new UserRepository();
export class AuthService{
    async registerUser(data: RegisterDTO){

        const emailExists = await userRepository.getUserByEmail(data.email);
        if(emailExists){ 
            throw new HttpError(409, "Email already exists");
        }
        // const usernameExists = await userRepository.getUserByUsername(data.username);
        // if(usernameExists){
        //     throw new HttpError(400, "Username already exists");
        // }
    
        const hashedPassword = await bcryptjs.hash(data.password, 10); 
        data.password = hashedPassword; 
        const newUser = await userRepository.createUser(data);
        

    const payload = {
        id: newUser._id,
        email: newUser.email,
        phone_number: newUser.phone_number,
        role: newUser.role
    };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });


    return { user: newUser, token };  
        
    }

    async loginUser(data: LoginDto){
        const user = await userRepository.getUserByEmail(data.email);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        const validPassowrd = await bcryptjs.compare(data.password, user.password);
      
        if(!validPassowrd){
            throw new HttpError(401, "Invalid credentials");
        }
    
        const payload = {
            id: user._id,
            email: user.email,
            phone_number: user.phone_number,
            role: user.role
        } 
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d'});
        return { user,token }
    }
    async updateUser(userId: string, data: UpdateUserDto){
        const user = await userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        if(user.email !== data.email){
            const emailExists = await userRepository.getUserByEmail(data.email!);
            if(emailExists){
                throw new HttpError(409, "Email already exists");
            }
        }
        if(data.password){
            const hashedPassword = await bcryptjs.hash(data.password, 10);
            data.password = hashedPassword;
        }
        const updatedUser = await userRepository.updateUserById(userId, data);
        return updatedUser;
    }
    async loginAdmin(data: AdminLoginDTO){
        const user = await userRepository.getUserByEmail(data.email);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        const validPassword = await bcryptjs.compare(data.password, user.password);
        if(!validPassword){
            throw new HttpError(401, "Invalid credentials");
        }
        // require that both request and DB indicate admin
        if(data.role !== 'admin' || user.role !== 'admin'){
            throw new HttpError(403, "Forbidden, Admins only");
        }

        const payload = {
            id: user._id,
            email: user.email,
            phone_number: user.phone_number,
            role: user.role
        };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
        return { user, token };
    }
}