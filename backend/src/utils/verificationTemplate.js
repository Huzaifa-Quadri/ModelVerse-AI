export const getVerificationHTML = (title, message, isSuccess = true) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: linear-gradient(135deg, #0d0e15 0%, #1a1c29 100%);
            color: #ffffff;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
        }
        .container {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 40px;
            max-width: 400px;
            width: 85%;
            text-align: center;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            animation: fadeIn 0.8s ease-out;
        }
        .icon {
            width: 80px;
            height: 80px;
            background: ${isSuccess ? "linear-gradient(135deg, #00C853 0%, #B2FF59 100%)" : "linear-gradient(135deg, #FF1744 0%, #FF8A80 100%)"};
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            box-shadow: 0 0 20px ${isSuccess ? "rgba(0, 200, 83, 0.4)" : "rgba(255, 23, 68, 0.4)"};
            animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.3s both;
        }
        .icon svg {
            width: 40px;
            height: 40px;
            fill: #ffffff;
        }
        h1 {
            font-size: 26px;
            margin: 0 0 10px;
            font-weight: 700;
            color: #ffffff;
            letter-spacing: 0.5px;
        }
        p {
            font-size: 16px;
            color: #a0a5b1;
            margin: 0 0 30px;
            line-height: 1.6;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #6200EA 0%, #B388FF 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 50px;
            font-size: 16px;
            font-weight: 600;
            transition: transform 0.2s, box-shadow 0.2s;
            box-shadow: 0 4px 15px rgba(98, 0, 234, 0.3);
            border: none;
            cursor: pointer;
        }
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(98, 0, 234, 0.5);
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
            from { transform: scale(0); }
            to { transform: scale(1); }
        }
        /* Mobile Specific Tweaks */
        @media (max-width: 480px) {
            .container {
                padding: 30px 20px;
            }
            h1 {
                font-size: 22px;
            }
            p {
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">
            ${
              isSuccess
                ? '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>'
                : '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
            }
        </div>
        <h1>${title}</h1>
        <p>${message}</p>
        <a href="${process.env.LOGIN_URL || "http://localhost:5173"}/login" class="btn">Go to Login</a>
    </div>
</body>
</html>
`;
