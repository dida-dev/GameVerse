import { sql } from "@vercel/postgres";

export default async function handler(req, res) {

    try {

        // GET = load messages
        if (req.method === "GET") {

            const { rows } = await sql`
                SELECT id, username, message, created_at
                FROM chat_messages
                ORDER BY created_at ASC
                LIMIT 100
            `;

            return res.status(200).json({
                success: true,
                messages: rows
            });
        }

        // POST = send message
        if (req.method === "POST") {

            const { username, message } = req.body || {};

            if (!username || !message) {
                return res.status(400).json({
                    success: false,
                    error: "Username and message are required"
                });
            }

            const cleanUsername =
                String(username).trim().slice(0, 20);

            const cleanMessage =
                String(message).trim().slice(0, 300);

            if (!cleanUsername || !cleanMessage) {
                return res.status(400).json({
                    success: false,
                    error: "Invalid message"
                });
            }

            const { rows } = await sql`
                INSERT INTO chat_messages
                (username, message)
                VALUES
                (${cleanUsername}, ${cleanMessage})
                RETURNING id, username, message, created_at
            `;

            return res.status(201).json({
                success: true,
                message: rows[0]
            });
        }

        // DELETE = admin delete/clear
        if (req.method === "DELETE") {

            const adminKey =
                req.headers["x-admin-key"];

            if (
                adminKey !== process.env.ADMIN_PASSWORD
            ) {
                return res.status(401).json({
                    success: false,
                    error: "Unauthorized"
                });
            }

            await sql`
                DELETE FROM chat_messages
            `;

            return res.status(200).json({
                success: true
            });
        }

        return res.status(405).json({
            success: false,
            error: "Method not allowed"
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            error: "Server error"
        });
    }
}
