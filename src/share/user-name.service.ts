import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker';

@Injectable()
export class UserNameService {
    private clientNames = new Map<string, string>();

    getOrCreateName(clientId: string): string {
        let name = this.clientNames.get(clientId);
        if (!name) {
            name = faker.person.fullName();
            this.clientNames.set(clientId, name);
        }
        return name;
    }

    getName(clientId: string): string | undefined {
        return this.clientNames.get(clientId);
    }

    deleteName(clientId: string) {
        this.clientNames.delete(clientId);
    }
}
