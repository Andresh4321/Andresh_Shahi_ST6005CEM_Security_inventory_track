
import { RegisterDTO,LoginDto, UpdateUserDto } from "../../dtos/auth/user.dto";
import UserRepository from "../../routes/repositories/auth/auth.respository"; 
import  bcryptjs from "bcryptjs"
import { HttpError } from "../../errors/http_error";

let userRepository = new UserRepository();

export class AdminUserService {
    async createUser(data: RegisterDTO){
        const emailCheck = await userRepository.getUserByEmail(data.email);
        if(emailCheck){
            throw new HttpError(403, "Email already in use");
        }
        // const usernameCheck = await userRepository.getUserByUsername(data.fullname);
        // if(usernameCheck){
        //     throw new HttpError(403, "Username already in use");
        // }
        // hash password
        const hashedPassword = await bcryptjs.hash(data.password, 10); // 10 - complexity
        data.password = hashedPassword;

        const newUser = await userRepository.createUser(data);
        return newUser;
    }

    async getAllUsers(page: number, limit: number) {
    return await userRepository.getAllUsers(page, limit);
}


    async deleteUser(id: string){
        const user = await userRepository.getUserById(id);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        const deleted = await userRepository.deleteUser(id);
        return deleted;
    }

    async updateUser(id: string, updateData: UpdateUserDto){
        const user = await userRepository.getUserById(id);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        const updatedUser = await userRepository.updateUser(id, updateData);
        return updatedUser;
    }

    async  getUserById(id: string){
        const user = await userRepository.getUserById(id);
        if(!user){
            throw new HttpError(404, "User not found");
        }
        return user;
    }

}