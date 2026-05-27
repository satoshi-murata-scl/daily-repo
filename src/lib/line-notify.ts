/** LINE Notify でメッセージ送信（トークンは店舗ごとに Store.lineNotifyToken） */
export async function sendLineNotify(token: string, message: string) {
  const res = await fetch("https://notify-api.line.me/api/notify", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ message }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LINE Notify failed: ${res.status} ${text}`);
  }
}
