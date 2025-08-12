import {Controller, Post, Body, Param} from '@nestjs/common';
import { TextService } from './text.service';

@Controller('text')
export class TextController {
    constructor(private readonly textService: TextService) {} // 서비스 주입

    @Post()
    async sayText(@Body('newText') newText: string) {
        console.log('받은 텍스트:', newText);
        const lastText = await this.textService.sayText(newText);
        console.log('반환할 텍스트:', lastText);
        return { received: lastText };
    }

    @Post('port/:port_str')
    async sayText_port(@Param('port_str') port_str:string, @Body('newText') newText: string) {
        console.log('인덱스:', port_str);
        console.log('받은 텍스트:', newText);
        const lastText = await this.textService.sayText_port(port_str, newText);
        console.log('반환할 텍스트:', lastText);
        return {received: lastText};
    }
}
