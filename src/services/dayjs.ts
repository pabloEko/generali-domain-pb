import { Service } from '@ekonoo/lambdi';
import dayjs from 'dayjs';
// import plugin
import customParseFormat from 'dayjs/plugin/customParseFormat';
import isLeapYear from 'dayjs/plugin/isLeapYear';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs().tz('Europe/Paris');

dayjs.extend(isLeapYear);
dayjs.extend(customParseFormat);

@Service({
    providers: []
})
export class DayjsService {
    getInitDate(year: number): string {
        return dayjs(`${year}-01-01`).format('YYYY-MM-DD'); // .valueOf();
    }

    getEndDate(year: number): string {
        // MM-DD-YYY
        return dayjs(`${year}-12-31`).format('YYYY-MM-DD'); // .endOf('year').valueOf();
    }
}
