"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const bcrypt = require("bcrypt");
const user_schema_1 = require("./schemas/user.schema");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    async create(createUserDto) {
        const { email } = createUserDto;
        console.log('Creating user with payload:', createUserDto);
        const existingUser = await this.userModel.findOne({ email }).exec();
        if (existingUser) {
            console.log(`User with email ${email} already exists`);
            throw new common_1.ConflictException('Email already in use');
        }
        const newUser = new this.userModel(createUserDto);
        try {
            const savedUser = await newUser.save();
            console.log('Saved user:', savedUser);
            return savedUser;
        }
        catch (error) {
            console.error('Error saving user:', error.message);
            throw error;
        }
    }
    async findAll(paginationDto) {
        const { page, limit } = paginationDto;
        const skip = (page - 1) * limit;
        const data = await this.userModel
            .find()
            .skip(skip)
            .limit(limit)
            .exec();
        const total = await this.userModel.countDocuments();
        return {
            data,
            total,
            page,
            limit,
        };
    }
    async findOne(id) {
        if (typeof id === 'string') {
            id = new mongoose_2.Types.ObjectId(id);
        }
        const user = await this.userModel.findById(id).exec();
        console.log('findByEmail - Found user:', user);
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByEmail(email) {
        try {
            console.log('Searching for user with email:', email);
            const user = await this.userModel.findOne({ email }).exec();
            if (!user) {
                console.error('User not found for email:', email);
                throw new common_1.NotFoundException(`User with email ${email} not found`);
            }
            console.log('Found user in database:', {
                id: user._id,
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                password: user.password
            });
            const formattedUser = {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                firstName: user.firstName,
                lastName: user.lastName,
                profilePicture: user.profilePicture,
                isActive: user.isActive,
                emailVerified: user.emailVerified,
                password: user.password
            };
            console.log('Returning formatted user:', formattedUser);
            return formattedUser;
        }
        catch (error) {
            console.error('Error in findByEmail:', error);
            throw error;
        }
    }
    async update(id, updateUserDto) {
        if (updateUserDto.email) {
            const existingUser = await this.userModel.findOne({
                email: updateUserDto.email,
                _id: { $ne: id },
            }).exec();
            if (existingUser) {
                throw new common_1.ConflictException('Email already in use');
            }
        }
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        const updatedUser = await this.userModel
            .findByIdAndUpdate(id, updateUserDto, { new: true })
            .exec();
        if (!updatedUser) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return updatedUser;
    }
    async remove(id) {
        const deletedUser = await this.userModel.findByIdAndDelete(id).exec();
        if (!deletedUser) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return deletedUser;
    }
    async setRefreshToken(userId, refreshToken) {
        const hashedRefreshToken = refreshToken ? await bcrypt.hash(refreshToken, 10) : null;
        await this.userModel.updateOne({ _id: userId }, { refreshToken: hashedRefreshToken });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map