// src/models/users/passwords.service.ts
import { Injectable } from '@nestjs/common';
import { HashingService, HashType } from '../../common/services/hashing.service';

@Injectable()
export class HashingPasswordsService {
    constructor(private hashingService: HashingService) {}

    async hash(plainPassword: string): Promise<string> {
        return this.hashingService.hash(plainPassword, HashType.PASSWORD);
    }

    async compare(
        plainPassword: string,
        hashedPassword: string,
    ): Promise<boolean> {
        return this.hashingService.compare(plainPassword, hashedPassword);
    }
}
