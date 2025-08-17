import { Injectable } from '@nestjs/common';

@Injectable()
export class UserNameService {
    private clientNames = new Map<string, string>();

    setName(clientId: string, name: string) {
        this.clientNames.set(clientId, name);
    }

    getName(clientId: string): string | undefined {
        return this.clientNames.get(clientId);
    }

    deleteName(clientId: string) {
        this.clientNames.delete(clientId);
    }
}
