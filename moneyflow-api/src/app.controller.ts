import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './auth/decorators';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Public()
	@Get('health-check')
    getHello(): string {
        return 'MoneyFlow API is running';
    }
}
