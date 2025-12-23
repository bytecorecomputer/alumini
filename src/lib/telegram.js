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
🚀 *New ${type === 'register' ? 'Registration' : 'Login'} Alert*

👤 *Name:* ${details.displayName || 'N/A'}
📧 *Email:* ${details.email}
🛡️ *Role:* ${details.role || 'N/A'}

🌐 *Network Details:*
📍 *IP:* \`${ip || 'Unknown'}\`
🏢 *City/Region:* ${city || 'Unknown'}, ${region || 'Unknown'}
🌍 *Country:* ${country_name || 'Unknown'}
📶 *Provider:* ${org || 'Unknown'}

⏰ *Time:* ${timeStr}
`.trim();
        } else if (type === 'job') {
            message = `
💼 *New Opportunity Alert*

📌 *Title:* ${details.title}
🏢 *Company:* ${details.company}
📍 *Location:* ${details.location}
🔗 *Type:* ${details.type}
🌐 *Gateway:* ${details.link}

👤 *Posted By:* ${details.posterName}
⏰ *Time:* ${timeStr}
`.trim();
        } else if (type === 'event') {
            message = `
📅 *New Event Alert*

🎭 *Event:* ${details.title}
🗓️ *Date:* ${details.date}
🕒 *Time:* ${details.time}
📍 *Location:* ${details.location}
📡 *Mode:* ${details.type}

👤 *Created By:* ${details.creatorName || details.createdBy || 'Admin'}
⏰ *Time:* ${timeStr}
`.trim();
        }

        await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });

    } catch (error) {
        console.error("Telegram notification failed:", error);
    }
};
