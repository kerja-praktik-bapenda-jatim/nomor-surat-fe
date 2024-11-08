export function convertUTC(utcTimestamp: string): string {
    // Convert the UTC timestamp into a Date object
    const date = new Date(utcTimestamp);
    if (isNaN(date.getTime())) {
        console.warn("Invalid date format:", utcTimestamp);
        return ""; // Kembalikan string kosong jika format tanggal tidak valid
    }
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

export function getAuthToken(role = "user") {
    let adminToken = "eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJlOTVlN2ExYi1jYjNkLTRiMjQtYmU2OC1lOWJkMDU1N2YyNTQiLCJpc0FkbWluIjp0cnVlLCJpYXQiOjE3MzA5MDMyNjMsImV4cCI6MTczMTUwODA2M30.mEHfruFI2BulICxlqQPUJsLWA4haFQWmcf2bqZz2TZOjGU-vTiS7SuBr3c9EHWFz";
    let userToken = "eyJhbGciOiJIUzM4NCIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI5NDZjYTg2Yi05YmU4LTQ2OTgtODk0MC0xZmMyYjUxODY1N2IiLCJpc0FkbWluIjpmYWxzZSwiaWF0IjoxNzMwODk2NzQ0LCJleHAiOjE3MzE1MDE1NDR9.4KT51e48RAhCzN1Dy4_YHJFdvSmAQUHdDWEsWbfSgF9OPTxJZTSuMZe_HiQwegP5";
    return role === "admin" ? adminToken : userToken;
}
