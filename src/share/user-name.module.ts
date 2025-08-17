import {Module} from "@nestjs/common";
import {UserNameService} from "./user-name.service";

@Module({
    providers: [UserNameService],
    exports: [UserNameService], // 반드시 exports에 추가!
})
export class UserNameModule {}
