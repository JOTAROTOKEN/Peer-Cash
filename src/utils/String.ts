export const getNoteString = (currency: String, amount: number, chainId: number, note: String) => {
    const noteString = `peercash-${currency}-${amount}-${chainId}-${note}`
    return noteString;
};

export const downloadText = (filename: string, text: string) => {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}
export const parseNote = (noteString:string) => {
    const noteRegex = /peercash-(?<currency>\w+)-(?<amount>[\d.]+)-(?<netId>\d+)-0x(?<note>[0-9a-fA-F]{124})/g;
    let match = noteRegex.exec(noteString);
    if (!match) {
        throw new Error('The note has invalid format');
    }

    let matchGroup = match.groups;
    const buf = Buffer.from(matchGroup?matchGroup.note:"", 'hex');
    const netId = Number(matchGroup?matchGroup.netId:"");

    return { amount: matchGroup?matchGroup.amount:"0", netId:matchGroup?matchGroup.netId:"0" };
}
export const secondsToStr = (seconds: number) => {
    if (seconds > 86400) // days
    {
        const day = Math.floor(seconds / 86400);
        if (day === 1)
            return "yesterday";
        return day.toString().concat(" days ago");
    }
    else if (seconds > 3600) // hours
    {
        const hour = Math.floor(seconds / 3600);
        if (hour === 1)
            return "an hour ago";
        return hour.toString().concat(hour > 1 ? " hours ago" : " hour ago");
    }
    else if (seconds > 60) // minutes
    {
        const min = Math.floor(seconds / 60);
        return min.toString().concat(min > 1 ? " minutes ago" : " minute ago");
    }
    else {
        return Math.floor(seconds>0?seconds:0).toString().concat(seconds > 1 ? " seconds ago" : " second ago");
    }
}