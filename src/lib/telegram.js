const escapeHTML = (text) => {
    if (!text) return 'N/A';
    return text.toString()
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
};

export const sendTelegramNotification = async (type, details) => {
    try {
        const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
        const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

        if (!botToken || !chatId) {
            console.warn("Telegram credentials not found");
            return;
        }

        // Fetch IP and Location info
        let ipData = {};
        try {
            const response = await fetch('https://ipapi.co/json/');
            ipData = await response.json();
        } catch (e) {
            console.error("Failed to fetch IP data", e);
        }

        const { ip, city, region, country_name, org } = ipData;
        const timeStr = new Date().toLocaleString();

        let message = '';

        if (type === 'register' || type === 'login') {
            message = `
🚀 <b>New ${type === 'register' ? 'Registration' : 'Login'} Alert</b>

👤 <b>Name:</b> ${escapeHTML(details.displayName)}
📧 <b>Email:</b> ${escapeHTML(details.email)}
🛡️ <b>Role:</b> ${escapeHTML(details.role)}

🌐 <b>Network Details:</b>
📍 <b>IP:</b> <code>${escapeHTML(ip)}</code>
🏢 <b>City/Region:</b> ${escapeHTML(city)}, ${escapeHTML(region)}
🌍 <b>Country:</b> ${escapeHTML(country_name)}
📶 <b>Provider:</b> ${escapeHTML(org)}

⏰ <b>Time:</b> ${timeStr}
`.trim();
        } else if (type === 'job') {
            message = `
💼 <b>New Opportunity Alert</b>

📌 <b>Title:</b> ${escapeHTML(details.title)}
🏢 <b>Company:</b> ${escapeHTML(details.company)}
📍 <b>Location:</b> ${escapeHTML(details.location)}
🔗 <b>Type:</b> ${escapeHTML(details.type)}
🌐 <b>Gateway:</b> ${escapeHTML(details.link)}

👤 <b>Posted By:</b> ${escapeHTML(details.posterName)}
⏰ <b>Time:</b> ${timeStr}
`.trim();
        } else if (type === 'event') {
            message = `
📅 <b>New Event Alert</b>

🎭 <b>Event:</b> ${escapeHTML(details.title)}
🗓️ <b>Date:</b> ${escapeHTML(details.date)}
🕒 <b>Time:</b> ${escapeHTML(details.time)}
📍 <b>Location:</b> ${escapeHTML(details.location)}
📡 <b>Mode:</b> ${escapeHTML(details.type)}

👤 <b>Created By:</b> ${escapeHTML(details.creatorName || details.createdBy)}
⏰ <b>Time:</b> ${timeStr}
`.trim();
        }

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });

    } catch (error) {
        console.error("Telegram notification failed:", error);
    }
};
