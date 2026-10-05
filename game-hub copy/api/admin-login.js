export default function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Method not allowed"
        });
    }

    const { username, password } = req.body || {};

    if (
        username === "user" &&
        password === "password"
    ) {
        return res.status(200).json({
            success: true
        });
    }

    return res.status(401).json({
        success: false
    });
}
