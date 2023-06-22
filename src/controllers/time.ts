import { DateTime } from 'luxon'
import { Controller, Get, Route } from 'tsoa'

@Route('/time')
export class TimeController extends Controller {
  @Get('/now')
  public getCurrentTime(): string {
    return DateTime.local().toISO()
  }
}
