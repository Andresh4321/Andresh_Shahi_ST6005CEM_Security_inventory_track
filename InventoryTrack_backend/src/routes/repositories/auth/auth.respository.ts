import { IUser} from "../../../models/auth/user.models";
import { UserModel } from "../../../models/auth/user.models";


export interface IUserRepository{
    createUser(data: Partial<IUser>): Promise<IUser>;
    getUserByEmail(email: string): Promise<IUser | null>;
    getUserByUsername(username: string): Promise<IUser | null>;
    getUserById(id: string): Promise<IUser | null>;
    getAllUsers(page: number, limit: number): Promise<{users: IUser[]; total: number;}>;
    updateUserById(id: string, data: Partial<IUser>): Promise<IUser | null>;
    deleteUserById(id: string): Promise<boolean | null>;
}

export class UserRepository implements IUserRepository{
    async createUser(data: Partial<IUser>){
        const newUser = new UserModel(data);
        await newUser.save(); // same as db.users.insertOne()
        return newUser;
    }
    async getUserByEmail(email: string){
        const user = await UserModel.findOne({ "email": email });
        return user;
    }
    async getUserByUsername(username: string){
        const user = await UserModel.findOne({ "username": username });
        return user;
    }

    async getUserById(id: string) {
        const user = await UserModel.findById(id);
        return user;
    }
    async getAllUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const users = await UserModel.find()
        .skip(skip)
        .limit(limit);

    const total = await UserModel.countDocuments();

    return { users, total };
}

    async updateUserById(id: string, data: Partial<IUser>){

        const updatedUser = 
            await UserModel.findByIdAndUpdate(id, data, { new: true });
        return updatedUser;
    }
    async deleteUserById(id: string){
        
        const result = await UserModel.findByIdAndDelete(id);
        return result ? true : false;
    }
    async updateProfileImage(id: string, image: string) {
    return UserModel.findByIdAndUpdate(
        id,
        { profileImage: image },
        { new: true }
    );
}
async updateUser(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
        // UserModel.updateOne({ _id: id }, { $set: updateData });
        const updatedUser = await UserModel.findByIdAndUpdate(
            id, updateData, { new: true } // return the updated document
        );
        return updatedUser;
    }
    async deleteUser(id: string): Promise<boolean> {
        // UserModel.deleteOne({ _id: id });
        const result = await UserModel.findByIdAndDelete(id);
        return result ? true : false;
    }


}
export default UserRepository;