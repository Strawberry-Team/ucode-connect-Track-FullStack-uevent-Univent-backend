// src/user/entity/user.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';

import { RefreshTokenNonce } from 'src/refresh-token-nonce/entity/refresh-token-nonce.entity';
import { Expose } from 'class-transformer';
import { BooleanTransformer } from 'src/common/transformers/boolean.transformer';

export const SERIALIZATION_GROUPS = {
    BASIC: ['basic'],
    CONFIDENTIAL: ['basic', 'confidential'],
};

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    @Expose({ groups: ['basic'] })
    id: number;

    @Column({ length: 255 })
    @Expose({ groups: ['confidential'] })
    password?: string;

    @Column({ name: 'first_name', length: 100 })
    @Expose({ groups: ['basic'] })
    firstName: string;

    @Column({ name: 'last_name', length: 100, nullable: true })
    @Expose({ groups: ['basic'] })
    lastName?: string;

    @Column({ unique: true, length: 255 })
    @Expose({ groups: ['basic'] })
    email: string;

    @Column({
        name: 'profile_picture_name',
        length: 255,
        default: 'default-avatar.png',
    })
    @Expose({ groups: ['basic'] })
    profilePictureName: string;

    @Column({
        name: 'email_verified',
        type: 'bit',
        width: 1,
        default: () => "b'0'",
        transformer: BooleanTransformer(false),
    })
    @Expose({ groups: ['confidential'] })
    emailVerified?: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    @Expose({ groups: ['basic'] })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    @Expose({ groups: ['basic'] })
    updatedAt: Date;

    @OneToMany(
        () => RefreshTokenNonce,
        (RefreshTokenNonce) => RefreshTokenNonce.user,
        {
            cascade: true,
        },
    )
    @Expose({ groups: ['confidential'] })
    refreshTokenNonces: Promise<RefreshTokenNonce[]>;
}
