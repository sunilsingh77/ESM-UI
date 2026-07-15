export class DateHelper {
  static format(date: string): string {
    return new Intl.DateTimeFormat('en-IN').format(new Date(date));
  }
}
