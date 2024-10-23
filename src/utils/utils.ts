export function convertUTC(utcTimestamp: string): string {
    // Convert the UTC timestamp into a Date object
    const date = new Date(utcTimestamp);

    // Create a formatter for just the date
    const dateOptions: Intl.DateTimeFormatOptions = {
        weekday: "short",
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "Asia/Jakarta",
    };

    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "numeric",
        timeZone: "Asia/Jakarta",
    };

    // Format the date and time separately
    const formattedDate = new Intl.DateTimeFormat('id-ID', dateOptions).format(date);
    const formattedTime = new Intl.DateTimeFormat('fr-FR', timeOptions).format(date);

    // Combine date and time without "pukul"
    return `${formattedDate} ${formattedTime}`;
}  